import React, {useRef, useState} from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    ScrollView,
    ActivityIndicator, NativeModules,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from "../theme/ThemeContext.tsx";
import {Appbar, Button, Dialog, List, Portal, Snackbar, TextInput} from 'react-native-paper';
import { formatFileSize } from "../utils/FileUtils.ts";
const { HashModule, FileUploadModule } = NativeModules;
import * as DocumentPicker from 'expo-document-picker';
import {DocumentPickerAsset} from "expo-document-picker";
import {create} from "../api/OllamaApi.ts";
import {useTranslation} from "react-i18next";
import {logger} from "../utils/LogUtils.ts";
import {getStyles} from "./UploadModelStyles.ts";
import {DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPLATE, MODEL_TEMPLATES} from "./UploadModelConst.ts";

const UploadModelPage = () => {
    const theme = useAppTheme();
    const styles = getStyles();
    const { t, i18n } = useTranslation();
    const log = logger.createModuleLogger('UploadModelPage');
    const navigation = useNavigation();

    const [modelName, setModelName] = useState('');
    const [uploadingDialogVisible, setUploadingDialogVisible] = useState(false);
    const [uploadInfo, setUploadInfo] = useState('');
    const [file, setFile] = useState<DocumentPickerAsset>();
    const [fileSha256, setFileSha256] = useState<string>('')
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    // Snackbar提示
    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [loadingDialogVisible, setLoadingDialogVisible] = useState(false);
    const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
    const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);

    const handleFileSelection = async () => {
        setLoadingDialogVisible(true);
        await DocumentPicker.getDocumentAsync({
            copyToCacheDirectory: false
        }).then((result)=>{
            if (result.assets) {
                if (result.assets[0].name.endsWith('.gguf')) {
                    const ggufFile = result.assets[0]
                    setFile(ggufFile)
                    setModelName(ggufFile.name ? ggufFile.name.replace(/\.gguf$/, '') : 'Unknown File')
                    HashModule.calculateSHA256(ggufFile.uri)
                        .then((hash: string) => {
                            setFileSha256(hash);
                        })
                        .catch((err: any) => {
                            setSnackbarMessage(t('calculateShaFailed'));
                            setSnackbarVisible(true);
                            log.error(`Calculate SHA256 error: ${err}`)
                        })
                } else {
                    setSnackbarMessage(t('fileTypeError'))
                    setSnackbarVisible(true)
                }
            }
        }).catch((error)=>{
            setSnackbarMessage(t('selectFileError'))
            setSnackbarVisible(true)
            setLoadingDialogVisible(false);
            log.error(`Select file error: ${error}`)
        }).finally(()=>{
            setLoadingDialogVisible(false);
        })
    };

    const handleUpload = async () => {
        if (!modelName || !file) {
            setSnackbarMessage(t('modelNameError'))
            setSnackbarVisible(true)
            return;
        }

        try {
            await FileUploadModule.uploadFile(
                file.uri,
                fileSha256,
            )
            setUploadingDialogVisible(true);
            setUploadInfo('Uploading...')
            create(
                modelName,
                {
                    [file.name]: `sha256:${fileSha256}`
                },
                template,
                systemPrompt,
                (response)=>{
                    setUploadInfo(response.status)
                }
            )
                .then((res)=>{
                    setSnackbarMessage(t('createModelSuccessful'))
                    setSnackbarVisible(true)
                })
                .catch((err)=>{
                    setSnackbarMessage(t('createModelFailed'))
                    setSnackbarVisible(true)
                    log.error(`Create model error: ${err}`)
                })
                .finally(()=>{
                    setUploadingDialogVisible(false);
                })
        } catch (error) {
            setSnackbarMessage(t('uploadFailed'));
            setSnackbarVisible(true)
            setUploadInfo(t('uploadFailed'));
            log.error(`Upload file error: ${error}`)
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <Appbar.Header mode={'center-aligned'}>
                    <Appbar.BackAction onPress={() => navigation.goBack()} />
                    <Appbar.Content title={t('uploadModel')} />
                </Appbar.Header>

                <ScrollView style={styles.uploadContainer}>
                    {file && (
                        <View>
                            <Text style={styles.text}>
                                {t('selectedFile')}: {file.name}
                            </Text>
                            <Text style={styles.text}>
                                {t('fileSize')}: {formatFileSize(file.size ? file.size : 0)}
                            </Text>
                            <Text style={styles.text}>
                                {t('fileSha')}: {fileSha256}
                            </Text>
                        </View>
                    )}
                    <TextInput
                        mode="outlined"
                        label={t('enterModelName')}
                        onChangeText={(text) => setModelName(text)}
                        value={modelName}
                        style={{ marginVertical: 8 }}
                    />
                    {/* 高级设置 */}
                    <View style={styles.advancedSettingsContainer}>
                        <Text style={styles.advancedSettingsTitle}>{t('advancedSettings')}</Text>
                        <List.Item
                            title={() => (
                                <Text style={{flex: 1, flexWrap: 'wrap'}}>
                                    {t('advancedSettingsWarn')}
                                </Text>
                            )}
                            left={() => <List.Icon icon="information" />}
                            titleStyle={{flex: 1}}
                            style={{alignItems: 'flex-start'}}
                        />
                        <List.Item
                            title={t('templatePreset')}
                            description={t('templatePresetDesc')}
                            left={() => <List.Icon icon="file-code" />}
                            onPress={() => {
                                // Auto-detect template from model name
                                const modelLower = modelName.toLowerCase()
                                if (modelLower.includes('llama')) setTemplate(MODEL_TEMPLATES.llama)
                                else if (modelLower.includes('mistral') || modelLower.includes('mixtral')) setTemplate(MODEL_TEMPLATES.mistral)
                                else if (modelLower.includes('gemma') || modelLower.includes('phi')) setTemplate(MODEL_TEMPLATES.gemma)
                                else setTemplate(MODEL_TEMPLATES.chatml)
                            }}
                        />
                        <TextInput
                            mode="outlined"
                            label={t('template')}
                            multiline
                            numberOfLines={3}
                            value={template}
                            onChangeText={(text) => setTemplate(text)}
                            style={{ marginVertical: 8 }}
                        />
                        <TextInput
                            mode="outlined"
                            label={t('systemPrompt')}
                            multiline
                            value={systemPrompt}
                            onChangeText={(text) => setSystemPrompt(text)}
                            style={{ marginVertical: 8 }}
                        />
                    </View>
                    <Button mode="contained" onPress={handleFileSelection} style={{ marginVertical: 8 }}>
                        {t('selectFile')}
                    </Button>
                    <Button mode="contained" onPress={handleUpload} style={{ marginVertical: 8 }}>
                        {t('upload')}
                    </Button>
                </ScrollView>
                <Portal>
                    <Dialog visible={loadingDialogVisible}>
                        <Dialog.Title>{t('waiting')}</Dialog.Title>
                        <Dialog.Content>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                                <Text style={[styles.text, { flex: 1 }]}>
                                    {t('loadingModelFile')} {file?.name}...
                                </Text>
                                <ActivityIndicator
                                    animating={true}
                                    color={theme.colors.primary}
                                    size={'large'}
                                />
                            </View>
                        </Dialog.Content>
                    </Dialog>
                </Portal>
                <Portal>
                    <Dialog visible={uploadingDialogVisible}>
                        <Dialog.Title>{t('uploading')}</Dialog.Title>
                        <Dialog.Content>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                                <Text style={[styles.text, { flex: 1 }]}>
                                    {uploadInfo}
                                </Text>
                                <ActivityIndicator
                                    animating={true}
                                    color={theme.colors.primary}
                                    size={'large'}
                                />
                            </View>
                        </Dialog.Content>
                    </Dialog>
                </Portal>
                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                >
                    {snackbarMessage}
                </Snackbar>
            </SafeAreaView>
        </View>
    );
};

export default UploadModelPage;
