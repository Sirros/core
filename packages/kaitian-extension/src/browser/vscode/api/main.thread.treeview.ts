import { IRPCProtocol } from '@ali/ide-connection';
import { Injectable, Autowired, Optinal } from '@ali/common-di';
import { TreeViewItem, TreeViewNode, CompositeTreeViewNode } from '../../../common/vscode';
import { TreeItemCollapsibleState } from '../../../common/vscode/ext-types';
import { IMainThreadTreeView, IExtHostTreeView, ExtHostAPIIdentifier, IExtHostMessage } from '../../../common/vscode';
import { TreeNode, MenuPath, URI, Emitter, ViewUiStateManager } from '@ali/ide-core-browser';
import { IMainLayoutService } from '@ali/ide-main-layout';
import { ExtensionTabbarTreeView } from '../components';
import { IIconService, IconType } from '@ali/ide-theme';

export const VIEW_ITEM_CONTEXT_MENU: MenuPath = ['view-item-context-menu'];
export const VIEW_ITEM_INLINE_MNUE: MenuPath = ['view-item-inline-menu'];

@Injectable({multiple: true})
export class MainThreadTreeView implements IMainThreadTreeView {
  private readonly proxy: IExtHostTreeView;

  @Autowired(IMainLayoutService)
  private readonly mainLayoutService: IMainLayoutService;

  @Autowired(IIconService)
  private readonly iconService: IIconService;

  readonly dataProviders: Map<string, TreeViewDataProviderMain> = new Map<string, TreeViewDataProviderMain>();

  constructor(@Optinal(IRPCProtocol) private rpcProtocol: IRPCProtocol) {
    this.proxy = this.rpcProtocol.getProxy(ExtHostAPIIdentifier.ExtHostTreeView);
  }

  dispose() {
    this.dataProviders.clear();
  }

  $registerTreeDataProvider(treeViewId: string): void {
    if (!this.dataProviders.has(treeViewId)) {
      const dataProvider = new TreeViewDataProviderMain(treeViewId, this.proxy, this.iconService);
      this.dataProviders.set(treeViewId, dataProvider);
      this.mainLayoutService.replaceViewComponent({
        id: treeViewId,
        name: treeViewId,
        component: ExtensionTabbarTreeView,
      }, {
        dataProvider: this.dataProviders.get(treeViewId),
        viewId: treeViewId,
      });
    }
  }

  $refresh(treeViewId: string, itemsToRefresh?: TreeViewItem) {
    const dataProvider = this.dataProviders.get(treeViewId);
    if (dataProvider) {
      dataProvider.refresh(itemsToRefresh);
    }
  }

  async $reveal(treeViewId: string, treeItemId: string) {

  }

}

export class TreeViewDataProviderMain {

  private treeDataChanged = new Emitter<any>();

  get onTreeDataChanged() {
    return this.treeDataChanged.event;
  }

  constructor(
    private treeViewId: string,
    private proxy: IExtHostTreeView,
    private iconService: IIconService,
  ) { }

  async createFolderNode(item: TreeViewItem): Promise<CompositeTreeViewNode> {
    const expanded = TreeItemCollapsibleState.Expanded === item.collapsibleState;
    const icon = await this.toIconClass(item);
    return {
      id: item.id,
      parent: undefined,
      name: item.label,
      label: item.label,
      icon,
      description: item.tooltip,
      visible: true,
      selected: false,
      expanded,
      children: [],
      command: item.command,
      contextValue: item.contextValue,
      depth: 0,
    };
  }

  async createFileNode(item: TreeViewItem): Promise<TreeViewNode> {
    const icon = await this.toIconClass(item);
    return {
      id: item.id,
      name: item.label,
      label: item.label,
      icon,
      description: item.tooltip,
      parent: undefined,
      visible: true,
      selected: false,
      contextValue: item.contextValue,
      command: item.command,
      depth: 0,
    };
  }

  async toIconClass(item: TreeViewItem): Promise<string | undefined> {
    if (item.iconUrl || item.icon) {
      return this.iconService.fromIcon('', item.iconUrl || item.icon, IconType.Background);
    } else {
      return '';
    }
  }

  /**
   * 创建节点
   *
   * @param item tree view item from the ext
   */
  async createTreeNode(item: TreeViewItem): Promise<TreeNode> {
    if (item.collapsibleState !== TreeItemCollapsibleState.None) {
      return await this.createFolderNode(item);
    }
    return await this.createFileNode(item);
  }

  async resolveChildren(itemId?: string): Promise<TreeNode[]> {
    const nodes: TreeNode[] = [];
    const children = await this.proxy.$getChildren(this.treeViewId, itemId);
    if (children) {
      for (const child of children) {
        const node = await this.createTreeNode(child);
        nodes.push(node);
      }
    }
    return nodes;
  }

  async refresh(itemsToRefresh?: TreeViewItem) {
    await this.treeDataChanged.fire(itemsToRefresh);
  }
}
