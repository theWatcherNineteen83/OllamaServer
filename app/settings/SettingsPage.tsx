import React, {useState, useEffect, useRef} from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    NativeModules, ToastAndroid, ScrollView, ActivityIndicator, Image, TouchableOpacity, Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {deleteModel, ps, pull, tags, unload} from "../api/OllamaApi.ts";
import {useAppTheme} from "../theme/ThemeContext.tsx";
import {Appbar, Button, Dialog, IconButton, List, Portal, ProgressBar, Switch, TextInput} from 'react-native-paper';
import {OLLAMA_SERVER} from "../api/API.ts";
import {formatFileSize} from "../utils/FileUtils.ts";
import LoadingDialog from "../components/LoadingDialog.tsx";
import { name as appName, version } from '../../package.json';
import {useTranslation} from "react-i18next";
import {logger} from "../utils/LogUtils.ts";
import {modelRecommendList} from "./ModelRecommend.ts";
const { OllamaConfigModule, OllamaServiceModule } = NativeModules;

const SettingsPage = () => {
    const theme = useAppTheme();
    const { t, i18n } = useTranslation();
    const log = logger.createModuleLogger('SettingsPage');
    const navigation = useNavigation();
    const DEEPSEEK = 'deepseek-r1:1.5b';
    const [modelName, setModelName] = useState(DEEPSEEK);
    const [downloadModelVisible, setDownloadModelVisible] = useState(false);
    const [startingServerDialogVisible, setStartingServerDialogVisible] = useState(false)
    const [closeServerVisible, setCloseServerVisible] = useState(false)
    const [serverRunning, setServerRunning] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [downloadProgressModelVisible, setDownloadProgressModelVisible] = useState(false);
    const [downloadInfo, setDownloadInfo] = useState('');
    const [modelListDialogVisible, setModelListDialogVisible] = useState(false)
    const [modelList, setModelList] = useState<OllamaModel[]>([])
    // 删除模型确认对话框
    const [deleteModelDialogVisible, setDeleteModelDialogVisible] = useState(false)
    // 删除模型名称
    const [deleteModelName, setDeleteModelName] = useState('');
    // 删除模型中对话框
    const [deletingModelDialogVisible, setDeletingModelDialogVisible] = useState(false)
    // 正在运行的模型对话框
    const [runningModelDialogVisible, setRunningModelDialogVisible] = useState(false)
    // 正在运行的模型
    const [runningModelList, setRunningModelList] = useState<OllamaRunningModel[]>([])
    // 关闭正在运行模型对话框
    const [unloadModelDialogVisible, setUnloadModelDialogVisible] = useState(false)
    // 关于对话框
    const [aboutDialogVisible, setAboutDialogVisible] = useState(false)
    // 模型推荐对话框
    const [modelRecommendDialogVisible, setModelRecommendDialogVisible] = useState(false)
    // 下载模型session引用
    const pullSessionRef = useRef<PullSessionType | null>(null);
    // 是否启用局域网监听
    const [lanListeningEnabled, setLanListeningEnabled] = useState(false);

    const checkServerStatus = async (): Promise<boolean> => {
        try {
            const response = await fetch(OLLAMA_SERVER);
            return response.ok;
        } catch (error) {
            log.error(`Error checking server status: ${error}`);
            return false;
        }
    };

    useEffect(() => {
        const initializeServerStatus = async () => {
            const isRunning = await checkServerStatus();
            setServerRunning(isRunning);
        };

        initializeServerStatus();

        const intervalId = setInterval(async () => {
            const isRunning = await checkServerStatus();
            setServerRunning(isRunning);
        }, 60000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const loadConfig = async () => {
            const enabled = await OllamaConfigModule.getLanListeningEnabled();
            setLanListeningEnabled(enabled);
        };
        loadConfig();
    }, []);

    const handleServerStatus = async () => {
        if (serverRunning) {
            setCloseServerVisible(true)
        } else {
            await OllamaServiceModule.startService();
            setStartingServerDialogVisible(true);
            // 轮询检测Ollama服务是否启动
            const pollingInterval = setInterval(async () => {
                if (await checkServerStatus()) {
                    clearInterval(pollingInterval);
                    clearTimeout(timeoutId);
                    setServerRunning(true);
                    setStartingServerDialogVisible(false);
                }
            }, 1000); // 每秒检测一次
            // 超时处理
            const timeoutId = setTimeout(() => {
                clearInterval(pollingInterval);
                setStartingServerDialogVisible(false);
                ToastAndroid.show('Ollama Server start timeout', ToastAndroid.SHORT)
                log.error('Ollama Server start timeout')
            }, 10000); // 10秒超时
            // 清理函数
            return () => {
                clearInterval(pollingInterval);
                clearTimeout(timeoutId);
            };
        }
    };

    const handleCloseServer = async () => {
        setCloseServerVisible(false)
        await OllamaServiceModule.stopService();
        setServerRunning(false)
    };

    const handleConfirmDownload = async (modelName: string) => {
        if (modelName) {
            setDownloadProgress(0);
            setDownloadInfo(t('startingDownload'));
            setDownloadModelVisible(false);
            setDownloadProgressModelVisible(true)
            pullSessionRef.current = pull(modelName, (pullResponse: PullResponse) => {
                if (pullResponse.completed != null && pullResponse.total != null) {
                    setDownloadProgress(pullResponse.completed / pullResponse.total)
                }
                setDownloadInfo(pullResponse.status);
            })
            pullSessionRef.current.promise
                .catch(e => {
                    ToastAndroid.show('Pull model error', ToastAndroid.SHORT);
                    log.error(`pull model error: ${e}`)
                })
                .finally(() => {
                    pullSessionRef.current = null
                    setDownloadProgressModelVisible(false)
                })
        }
    };

    const handleRecommendDownload = async (modelName: string)=> {
        setModelRecommendDialogVisible(false)
        setModelName(modelName)
        await handleConfirmDownload(modelName)
    }

    // 获取模型列表
    const handleModelList = () => {
        setModelListDialogVisible(true)
        tags()
            .then((response) => {
                setModelList(response.models)
            })
            .catch((err)=>{
                ToastAndroid.show('Error: ' + err.message, ToastAndroid.SHORT)
                log.error(`get model list error: ${err}`)
            })
    };

    // 处理删除模型对话框展示
    const handleDeleteModelDialog = (modelName: string) => {
        setDeleteModelName(modelName)
        setDeleteModelDialogVisible(true)
    };

    // 处理删除模型逻辑
    const handleDeleteModel = () => {
        setDeleteModelDialogVisible(false)
        setDeletingModelDialogVisible(true)
        deleteModel(deleteModelName)
            .catch((err)=>{
                ToastAndroid.show(`Delete Model ${deleteModelName} error`, ToastAndroid.SHORT)
                log.error(`Delete Model ${deleteModelName} error: ${err}`)
            })
            .finally(()=>{
                setDeletingModelDialogVisible(false)
                handleModelList()
            })
    };

    // 处理正在运行的模型
    const handleRunningModel = () => {
        setRunningModelDialogVisible(true)
        ps()
            .then((response)=>{
                setRunningModelList(response.models)
            })
            .catch((err)=>{
                ToastAndroid.show(`Get Running Model error`, ToastAndroid.SHORT)
                log.error(`Get Running Model error: ${err}`)
            })
    }

    // 处理关闭运行模型
    const handleUnloadModel = (model: OllamaRunningModel) => {
        setUnloadModelDialogVisible(true)
        unload(model.name)
            .then((response)=>{
                if (response.done && response.done_reason == 'unload') {
                    // 因为模型关闭后立刻获取运行列表可能还会获取到，所以先过滤掉
                    setRunningModelList(runningModelList.filter((runningModel)=>runningModel != model))
                } else {
                    ToastAndroid.show(`Unload Model ${model.name} error`, ToastAndroid.SHORT)
                    log.error(`Unload Model ${model.name} error. Response: ${response}`)
                }
            })
            .catch((err)=>{
                ToastAndroid.show(`Unload Model ${model.name} error`, ToastAndroid.SHORT)
                log.error(`Unload Model ${model.name} error: ${err}`)
            })
            .finally(()=>{
                setUnloadModelDialogVisible(false)
            })
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.surface,
        },
        safeArea: {
            flex: 1,
        },
        settingsContainer: {
            paddingHorizontal: 16,
        },
        text: {
            color: theme.colors.onSurface
        }
    });

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <Appbar.Header mode={'center-aligned'}>
                    <Appbar.BackAction onPress={() => {navigation.goBack()}} />
                    <Appbar.Content title={t('settings')}/>
                </Appbar.Header>

                <ScrollView>
                    <List.Section style={styles.settingsContainer}>
                        <List.Subheader>{t('serverSettings')}</List.Subheader>
                        <List.Item
                            title={t('serverStatus')}
                            left={() => <List.Icon icon="server" />}
                            description={serverRunning ? t('serverRunning') : t('serverNotRunning')}
                            onPress={handleServerStatus}
                        />
                        <List.Item
                            title={t('enableLanListening')}
                            left={() => <List.Icon icon="lan" />}
                            description={t('enableLanListeningDesc')}
                            onPress={async () => {
                                const newValue = !lanListeningEnabled;
                                await OllamaConfigModule.setLanListeningEnabled(newValue);
                                setLanListeningEnabled(newValue);
                            }}
                            right={() => (
                                <Switch
                                    value={lanListeningEnabled}
                                    onValueChange={async (value) => {
                                        await OllamaConfigModule.setLanListeningEnabled(value);
                                        setLanListeningEnabled(value);
                                    }}
                                />
                            )}
                        />
                        <List.Item
                            title={t('serverLog')}
                            left={() => <List.Icon icon="note-text" />}
                            onPress={()=>{
                                // @ts-ignore
                                navigation.navigate('Logs')
                            }}
                        />
                        {serverRunning && (
                            <View>
                                <List.Subheader>{t('modelSettings')}</List.Subheader>
                                <List.Item
                                    title={t('downloadModel')}
                                    description={t('downloadModelDesc')}
                                    left={() => <List.Icon icon="cloud-download" />}
                                    onPress={()=>{setDownloadModelVisible(true)}}
                                />
                                <List.Item
                                    title={t('uploadModel')}
                                    description={t('uploadModelDesc')}
                                    left={() => <List.Icon icon="upload" />}
                                    onPress={()=>{
                                        // @ts-ignore
                                        navigation.navigate('UploadModel')
                                    }}
                                />
                                <List.Item
                                    title={t('modelList')}
                                    left={() => <List.Icon icon="format-list-text" />}
                                    onPress={handleModelList}
                                />
                                <List.Item
                                    title={t('runningModel')}
                                    left={() => <List.Icon icon="rocket-launch" />}
                                    onPress={handleRunningModel}
                                />
                            </View>
                        )}
                        <View>
                            <List.Subheader>{t('appSettings')}</List.Subheader>
                            <List.Item
                                title={t('about')}
                                left={() => <List.Icon icon="information" />}
                                onPress={()=>{setAboutDialogVisible(true)}}
                            />
                        </View>
                    </List.Section>
                </ScrollView>

                <Portal>
                    <Dialog visible={closeServerVisible}>
                        <Dialog.Title>{t('closeServer')}</Dialog.Title>
                        <Dialog.Content>
                            <Text style={styles.text}>{t('closeServerMsg')}</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => handleCloseServer()}>{t('ok')}</Button>
                            <Button onPress={() => setCloseServerVisible(false)}>{t('cancel')}</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
                <Portal>
                    <Dialog visible={downloadModelVisible} onDismiss={()=>{setDownloadModelVisible(false)}}>
                        <Dialog.Title>{t('downloadModel')}</Dialog.Title>
                        <TextInput
                            mode="outlined"
                            label={t('enterInformation')}
                            onChangeText={(text)=>{setModelName(text)}}
                            placeholder={DEEPSEEK}
                            defaultValue={modelName}
                            style={{ marginHorizontal: 16, marginVertical: 8 }}
                        />
                        <Dialog.Actions>
                            <Button onPress={() => {
                                setDownloadModelVisible(false)
                                setModelRecommendDialogVisible(true)
                            }}>{t('modelRecommendMsg')}</Button>
                        </Dialog.Actions>
                        <Dialog.Actions>
                            <Button onPress={() => setDownloadModelVisible(false)}>{t('cancel')}</Button>
                            <Button onPress={() => handleConfirmDownload(modelName)}>{t('ok')}</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
                <Portal>
                    <Dialog visible={downloadProgressModelVisible}>
                        <Dialog.Title>{t('downloading')} {modelName}</Dialog.Title>
                        <Dialog.Content>
                            <Text style={styles.text}>{downloadInfo}</Text>
                            <ProgressBar progress={downloadProgress} color={theme.colors.primary} />
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => {
                                pullSessionRef.current?.abort()
                                setDownloadProgressModelVisible(false)
                            }}>{t('cancel')}</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
                <LoadingDialog
                    visible={startingServerDialogVisible}
                    title={t('waiting')}
                    message={t('serverStarting')}
                />
                <Portal>
                    <Dialog visible={modelListDialogVisible} onDismiss={() => {setModelListDialogVisible(false)}}>
                        <Dialog.Title>{t('modelList')}</Dialog.Title>
                        <Dialog.ScrollArea>
                            <ScrollView>
                                {modelList.map(model => (
                                    <List.Item
                                        key={model.name}
                                        title={model.name}
                                        description={formatFileSize(model.size)}
                                        right={()=>(
                                            <IconButton
                                                icon="delete"
                                                iconColor={theme.colors.error}
                                                onPress={()=>{handleDeleteModelDialog(model.name)}}
                                            />
                                        )}
                                    />
                                ))}
                            </ScrollView>
                        </Dialog.ScrollArea>
                        <Dialog.Actions>
                            <Button onPress={() => setModelListDialogVisible(false)}>{t('ok')}</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
                <Portal>
                    <Dialog visible={deleteModelDialogVisible}>
                        <Dialog.Title>{t('deleteModel')}</Dialog.Title>
                        <Dialog.Content>
                            <Text style={styles.text}>{t('deleteModelMsg')} {deleteModelName}?</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => handleDeleteModel()}>Ok</Button>
                            <Button onPress={() => setDeleteModelDialogVisible(false)}>Cancel</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
                <LoadingDialog
                    visible={deletingModelDialogVisible}
                    title={t('waiting')}
                    message={`${t('deleteModel')} ${deleteModelName}...`}
                />
                <Portal>
                    <Dialog visible={runningModelDialogVisible} onDismiss={() => {setRunningModelDialogVisible(false)}}>
                        <Dialog.Title>{t('runningModel')}</Dialog.Title>
                        <Dialog.ScrollArea>
                            <ScrollView>
                                {runningModelList.map(model => (
                                    <List.Item
                                        key={model.name}
                                        title={model.name}
                                        description={formatFileSize(model.size)}
                                        right={()=>(
                                            <IconButton
                                                icon="stop-circle-outline"
                                                iconColor={theme.colors.error}
                                                onPress={()=>{handleUnloadModel(model)}}
                                            />
                                        )}
                                    />
                                ))}
                            </ScrollView>
                        </Dialog.ScrollArea>
                        <Dialog.Actions>
                            <Button onPress={() => setRunningModelDialogVisible(false)}>{t('ok')}</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
                <LoadingDialog
                    visible={unloadModelDialogVisible}
                    title={t('waiting')}
                    message={t('unloadModel')}
                />
                <Portal>
                    <Dialog visible={aboutDialogVisible} onDismiss={() => {setAboutDialogVisible(false)}}>
                        <Dialog.Content>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                gap: 20
                            }}>
                                <Image
                                    source={require('../assets/ollama.png')}
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 8,
                                    }}
                                />
                                <View style={{
                                    flex: 1,
                                    alignItems: 'flex-start'
                                }}>
                                    <View>
                                        <Text style={{
                                            fontSize: 18,
                                            fontWeight: '700',
                                            color: theme.colors.onSurface,
                                        }}>
                                            {appName}
                                        </Text>
                                        <Text style={{
                                            color: theme.colors.onSurface,
                                            letterSpacing: 0.3
                                        }}>
                                            v{version}
                                        </Text>
                                    </View>
                                    <Text style={{
                                        color: theme.colors.onSurface,
                                    }}>
                                        {t('developer')}
                                    </Text>
                                    <TouchableOpacity
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}
                                        onPress={() => Linking.openURL('https://github.com/sunshine0523/OllamaServer')}
                                    >
                                        <Text style={{
                                            color: theme.customColors.link,
                                            fontSize: 14,
                                            textDecorationLine: 'underline'
                                        }}>
                                            {t('githubRepo')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Dialog.Content>
                    </Dialog>
                </Portal>
                <Portal>
                    <Dialog visible={modelRecommendDialogVisible} onDismiss={() => {setModelRecommendDialogVisible(false)}}>
                        <Dialog.Title>{t('modelRecommend')}</Dialog.Title>
                        <Dialog.ScrollArea>
                            <ScrollView>
                                {modelRecommendList.map(model => (
                                    <List.Item
                                        key={model.modelName}
                                        title={model.modelName}
                                        description={model.description}
                                        right={()=>(
                                            <IconButton
                                                icon="download"
                                                onPress={()=>{handleRecommendDownload(model.modelName)}}
                                            />
                                        )}
                                    />
                                ))}
                            </ScrollView>
                        </Dialog.ScrollArea>
                        <List.Item
                            title={
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                    <Text style={styles.text}>
                                        {t('moreModelsPrompt')}
                                    </Text>
                                    <TouchableOpacity onPress={() => Linking.openURL('https://ollama.com/library')}>
                                        <Text style={{
                                            color: theme.customColors.link,
                                        }}>
                                            {t('ollamaOfficial')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            }
                            left={() => <List.Icon icon="information" />}
                            style={{
                                paddingVertical: 0,
                                paddingHorizontal: 16
                            }}
                        />
                        <Dialog.Actions>
                            <Button onPress={() => setModelRecommendDialogVisible(false)}>{t('ok')}</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </SafeAreaView>
        </View>
    );
};

export default SettingsPage;
