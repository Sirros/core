import { createMonacoEditorApi } from './editor';
import { createMonacoLanguageApi } from './languages';

export const monaco = Object.freeze({
  editor: createMonacoEditorApi(),
  languages: createMonacoLanguageApi(),
});

export { URI } from '@ali/monaco-editor-core/esm/vs/base/common/uri';
