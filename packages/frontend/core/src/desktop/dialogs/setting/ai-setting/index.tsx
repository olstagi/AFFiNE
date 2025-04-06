import {
  Menu,
  MenuItem,
  MenuTrigger,
  RowInput,
  Switch,
  useConfirmModal,
} from '@affine/component';
import {
  SettingRow,
  SettingWrapper,
} from '@affine/component/setting-components';
import { ServerService } from '@affine/core/modules/cloud'; // Предполагаемый путь
import { FeatureFlagService } from '@affine/core/modules/feature-flag';
import { useI18n } from '@affine/i18n';
import { ArrowDownSmallIcon, DoneIcon } from '@blocksuite/icons/rc';
import { useLiveData, useService, useServices } from '@toeverything/infra';
import { cssVarV2 } from '@toeverything/theme/v2'; // Импортируем cssVarV2
import clsx from 'clsx';
import { useCallback, useEffect, useState } from 'react';

// Удаляем импорт стилей селектора
// Используем стили из general.tsx для единообразия
import * as generalStyles from '../general-setting/editor/style.css';

// Ключ для localStorage (только для провайдера)
const AI_PROVIDER_LS_KEY = 'affine-ai-provider';

export const AiSettings = () => {
  const t = useI18n();
  const { openConfirmModal } = useConfirmModal();

  // Загружаем выбранного провайдера из localStorage, остальное - в состоянии
  const [selectedProvider, setSelectedProvider] = useState<string>(() => {
    return localStorage.getItem(AI_PROVIDER_LS_KEY) || 'openai'; // Загрузка при инициализации
  });
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState<string>('');
  const [openaiApiKey, setOpenaiApiKey] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');

  // Сохраняем выбранного провайдера в localStorage при изменении
  useEffect(() => {
    localStorage.setItem(AI_PROVIDER_LS_KEY, selectedProvider);
  }, [selectedProvider]);

  // Логика включения/выключения AI
  const { featureFlagService, serverService } = useServices({
    FeatureFlagService,
    ServerService,
  });
  const serverFeatures = useLiveData(serverService.server.features$);
  const enableAI = useLiveData(featureFlagService.flags.enable_ai.$);

  const onAIChange = useCallback(
    (checked: boolean) => {
      featureFlagService.flags.enable_ai.set(checked);
    },
    [featureFlagService]
  );
  const onToggleAI = useCallback(
    (checked: boolean) => {
      openConfirmModal({
        title: checked
          ? t['com.affine.settings.editorSettings.general.ai.enable.title']()
          : t['com.affine.settings.editorSettings.general.ai.disable.title'](),
        description: checked
          ? t[
              'com.affine.settings.editorSettings.general.ai.enable.description'
            ]()
          : t[
              'com.affine.settings.editorSettings.general.ai.disable.description'
            ](),
        confirmText: checked
          ? t['com.affine.settings.editorSettings.general.ai.enable.confirm']()
          : t[
              'com.affine.settings.editorSettings.general.ai.disable.confirm'
            ](),
        cancelText: t['Cancel'](),
        onConfirm: () => onAIChange(checked),
        confirmButtonOptions: {
          variant: checked ? 'primary' : 'error',
        },
      });
    },
    [openConfirmModal, t, onAIChange]
  );

  // TODO: Добавить логику получения реальной конфигурации с бэкенда

  if (!serverFeatures?.copilot) {
    // Проверяем доступность функции
    return null;
  }

  return (
    <SettingWrapper title={t['com.affine.settings.aiSettings.title']()}>
      <SettingRow
        name={t[
          'com.affine.settings.workspace.experimental-features.enable-ai.name'
        ]()}
        desc={t[
          'com.affine.settings.workspace.experimental-features.enable-ai.description'
        ]()}
      >
        <Switch checked={enableAI} onChange={onToggleAI} />
      </SettingRow>

      {/* Настройки провайдера */}
      {enableAI && ( // Показываем только если AI включен
        <>
          <SettingRow
            name={t['com.affine.settings.aiProvider.title']()}
            desc={t['com.affine.settings.aiProvider.description']()}
          >
            {/* Возвращаем div-обертку с классом settingWrapper */}
            <div className={generalStyles.settingWrapper}>
              <Menu
                items={
                  // Убираем ul и классы стилей селектора
                  <>
                    {/* TODO: Динамически генерировать опции */}
                    {/* Возвращаем suffixIcon */}
                    <MenuItem
                      onSelect={() => setSelectedProvider('openai')}
                      suffixIcon={
                        selectedProvider === 'openai' ? <DoneIcon /> : null
                      }
                    >
                      OpenAI
                    </MenuItem>
                    <MenuItem
                      onSelect={() => setSelectedProvider('gemini')}
                      suffixIcon={
                        selectedProvider === 'gemini' ? <DoneIcon /> : null
                      }
                    >
                      Gemini
                    </MenuItem>
                    <MenuItem
                      onSelect={() => setSelectedProvider('ollama')}
                      suffixIcon={
                        selectedProvider === 'ollama' ? <DoneIcon /> : null
                      }
                    >
                      Ollama
                    </MenuItem>
                    {/* Добавить другие провайдеры */}
                  </>
                }
              >
                {/* Применяем inline-стили к MenuTrigger для корректного отображения */}
                <MenuTrigger
                  style={{
                    width: '100%', // Заполняем родительский div
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between', // Текст слева, иконка справа
                    padding: '0 8px', // Добавляем горизонтальные отступы
                    height: '32px', // Стандартная высота для инпутов/селектов (можно подстроить)
                    borderRadius: '8px', // Скругление углов (можно подстроить)
                    // Используем CSS переменные темы напрямую
                    border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
                    background: cssVarV2('layer/background/primary'),
                    cursor: 'pointer',
                  }}
                >
                  {selectedProvider === 'openai'
                    ? 'OpenAI'
                    : selectedProvider === 'gemini'
                      ? 'Gemini'
                      : selectedProvider === 'ollama'
                        ? 'Ollama'
                        : selectedProvider}
                  {/* Убираем вручную добавленную иконку, MenuTrigger добавит свою */}
                </MenuTrigger>
              </Menu>
            </div>
          </SettingRow>

          {selectedProvider === 'ollama' && (
            <SettingRow
              name={t['com.affine.settings.ollamaBaseUrl.title']()}
              desc={t['com.affine.settings.ollamaBaseUrl.description']()}
            >
              <RowInput
                className={generalStyles.settingWrapper}
                placeholder="http://localhost:11434"
                value={ollamaBaseUrl}
                onChange={setOllamaBaseUrl}
              />
            </SettingRow>
          )}
          {selectedProvider === 'openai' && (
            <SettingRow
              name={t['com.affine.settings.openaiApiKey.title']()}
              desc={t['com.affine.settings.openaiApiKey.description']()}
            >
              <RowInput
                type="password"
                className={generalStyles.settingWrapper}
                placeholder="sk-..."
                value={openaiApiKey}
                onChange={setOpenaiApiKey}
              />
            </SettingRow>
          )}
          {selectedProvider === 'gemini' && (
            <SettingRow
              name={t['com.affine.settings.geminiApiKey.title']()}
              desc={t['com.affine.settings.geminiApiKey.description']()}
            >
              <RowInput
                type="password"
                className={generalStyles.settingWrapper}
                placeholder="AIza..."
                value={geminiApiKey}
                onChange={setGeminiApiKey}
              />
            </SettingRow>
          )}
        </>
      )}
    </SettingWrapper>
  );
};
