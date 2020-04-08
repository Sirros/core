import * as React from 'react';
import { Injectable } from '@ali/common-di';
import { IMessageService, AbstractMessageService, MAX_MESSAGE_LENGTH } from '../common';
import { notification, open } from '@ali/ide-components';
import { Deferred, MessageType, uuid } from '@ali/ide-core-common';
import * as styles from './message.module.less';

const OriginalMessage = ({ message, from }: { message: string | React.ReactNode; from: string }) => {
  return (
    <>
      <div className={styles.message_origin}>
        {message}
      </div>
      <span className={styles.origin}>
        来源: {from}
      </span>
    </>
  );
};

@Injectable()
export class MessageService extends AbstractMessageService implements IMessageService {

  // 上一个展示的文案
  private preMessage: string | React.ReactNode;

  // 当前组件展示的时间
  private showTime: number = 0;

  // 相同文案返回的间隔时间
  protected static SAME_MESSAGE_DURATION = 3000;

  // 参考 vscode message 组件消失的时间
  protected static DURATION: { [type: number]: number } = {
    [MessageType.Info]: 15000,
    [MessageType.Warning]: 18000,
    [MessageType.Error]: 20000,
  };

  /**
   *
   * @param rawMessage messgae
   * @param type MessageType
   * @param buttons buttons
   * @param closable true | false
   * @param from from extension
   */
  open<T = string>(rawMessage: string | React.ReactNode, type: MessageType, buttons?: string[], closable: boolean = true, from?: string): Promise<T | undefined> {
    let message = rawMessage;
    if (typeof rawMessage === 'string' && rawMessage.length > MAX_MESSAGE_LENGTH) {
      message = `${rawMessage.substr(0, MAX_MESSAGE_LENGTH)}...`;
    }
    console.log(from);
    if (from && typeof from === 'string') {
      message = <OriginalMessage message={message} from={from} />;
    }
    // 如果两秒内提示信息相同，则直接返回上一个提示
    if (Date.now() - this.showTime < MessageService.SAME_MESSAGE_DURATION && this.preMessage === message) {
      return Promise.resolve(undefined);
    }
    console.log(message);
    this.preMessage = message;
    this.showTime = Date.now();
    const key = uuid();
    const deferred = new Deferred<T>();
    const maybyDeferred = open(message, type, closable, key, buttons, deferred);
    return maybyDeferred || Promise.resolve(undefined);
  }

  hide(): void {
    notification.destroy();
  }
}
