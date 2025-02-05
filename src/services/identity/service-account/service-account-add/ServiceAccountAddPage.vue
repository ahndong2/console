<template>
    <general-page-layout class="add-service-account-container">
        <div class="flex">
            <p-breadcrumbs class="flex-grow" :routes="routeState.routes" />
            <info-button v-if="description" :visible="!!description"
                         class="flex-shrink-0"
            >
                <template #contents>
                    <p-markdown :markdown="description.options.markdown"
                                :data="description.options.markdown"
                                :language="$store.state.user.language"
                                class="!p-0"
                    />
                </template>
            </info-button>
        </div>
        <p-page-title class="mb-6"
                      child
                      @goBack="onClickGoBack"
        >
            <template #title>
                <div class="page-title">
                    <p-lazy-img class="icon" :src="providerIcon" :alt="provider"
                                :loading="providerLoading"
                                error-icon="ic_provider_other"
                    />
                    {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.TITLE') }}
                </div>
            </template>
        </p-page-title>

        <p-pane-layout>
            <div class="title">
                {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.BASE_TITLE') }}
            </div>
            <p-field-group :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_LABEL')"
                           :invalid-text="accountNameInvalidText"
                           :invalid="accountName && !isAccountNameValid"
                           :required="true"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="accountName"
                                  class="block"
                                  :invalid="invalid"
                                  :placeholder="$t('IDENTITY.SERVICE_ACCOUNT.ADD.BASE_NAME_PLACEHOLDER')"
                    />
                </template>
            </p-field-group>
            <p-json-schema-form :model.sync="accountModel" :schema="accountSchema" :is-valid.sync="isAccountModelValid" />
            <div class="tag-title">
                {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.TAG_LABEL') }}
            </div>
            <div class="tag-help-msg">
                <i18n path="IDENTITY.SERVICE_ACCOUNT.ADD.TAG_DESC_1">
                    <template #name>
                        <span v-if="accountName" class="font-bold">[{{ accountName }}]</span>
                        <span v-else>{{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.ACCOUNT') }}</span>
                    </template>
                </i18n>
                <br>
                {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.TAG_DESC_2') }}
            </div>
            <tags-input-group :tags.sync="tags"
                              :show-validation="true"
                              :is-valid.sync="isTagsValid"
            >
                <template #addButton="scope">
                    <p-icon-text-button
                        outline style-type="primary" :disabled="scope.disabled"
                        name="ic_plus_bold"
                        class="mb-2"
                        @click="scope.addPair($event)"
                    >
                        {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.TAG_ADD') }}
                    </p-icon-text-button>
                </template>
            </tags-input-group>
        </p-pane-layout>

        <p-pane-layout>
            <div class="title">
                {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.CREDENTIALS_TITLE') }}
            </div>
            <p-field-group :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_LABEL')"
                           :invalid-text="credentialNameInvalidText"
                           :invalid="credentialName && !isCredentialNameValid"
                           :required="true"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="credentialName"
                                  class="block"
                                  :invalid="invalid"
                                  :placeholder="$t('IDENTITY.SERVICE_ACCOUNT.ADD.CREDENTIALS_NAME_PLACEHOLDER')"
                    />
                </template>
            </p-field-group>

            <p-field-group label="Secret Type" required>
                <div class="flex">
                    <span v-for="(type, idx) in secretTypes" :key="idx" class="secret-type-text">
                        <p-radio v-model="selectedSecretType" :value="type" />
                        {{ type }}
                    </span>
                </div>
            </p-field-group>
            <p-tab :tabs="tabState.tabs" :active-tab.sync="tabState.activeTab" stretch>
                <template #input>
                    <p-json-schema-form :model.sync="credentialModel" :schema="credentialSchema" :is-valid.sync="isCredentialModelValid"
                                        class="custom-schema-box"
                    />
                </template>
                <template #json>
                    <p-text-editor class="m-4" :code.sync="jsonForCredential" mode="edit" />
                </template>
            </p-tab>
        </p-pane-layout>

        <project-tree-panel class="tree-panel"
                            :target-name="accountName"
                            @select="selectedProject = $event"
        />
        <div class="button-group">
            <p-button class="text-button" style-type="primary-dark" size="lg"
                      :disabled="!isValid"
                      @click="onClickSave"
            >
                {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.SAVE') }}
            </p-button>
            <p-button class="text-button" style-type="outline gray900" size="lg"
                      @click="onClickGoBack"
            >
                {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.CANCEL') }}
            </p-button>
        </div>
    </general-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { get } from 'lodash';

import {
    ComponentRenderProxy, getCurrentInstance,
    reactive, computed, toRefs, watch,
} from '@vue/composition-api';

import {
    PPageTitle, PJsonSchemaForm, PTab, PFieldGroup, PLazyImg,
    PBreadcrumbs, PPaneLayout, PIconTextButton, PRadio, PMarkdown, PTextEditor, PButton, PTextInput,
} from '@spaceone/design-system';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import ProjectTreePanel from '@/services/identity/service-account/service-account-add/modules/ProjectTreePanel.vue';
import TagsInputGroup from '@/common/components/forms/tags-input-group/TagsInputGroup.vue';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ProjectGroup, ProviderModel } from '@/services/identity/service-account/type';
import { TranslateResult } from 'vue-i18n';
import InfoButton from '@/common/modules/portals/InfoButton.vue';


export default {
    name: 'AddServiceAccountPage',
    components: {
        InfoButton,
        PLazyImg,
        PTab,
        PTextInput,
        PJsonSchemaForm,
        PTextEditor,
        PMarkdown,
        PPageTitle,
        PBreadcrumbs,
        PFieldGroup,
        PPaneLayout,
        PIconTextButton,
        PButton,
        PRadio,
        TagsInputGroup,
        GeneralPageLayout,
        ProjectTreePanel,
    },
    props: {
        provider: {
            type: String,
            default: null,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            providerLoading: true,
            providerObj: {} as ProviderModel,
            serviceAccountId: '',
            providerIcon: computed(() => vm.$store.state.resource.provider.items[state.providerObj?.provider]?.icon),
            description: computed(() => get(state.providerObj, 'metadata.view.layouts.help:service_account:create', undefined)),
            selectedSecretType: '',
            serviceAccountNames: [] as string[],
            credentialNames: [] as string[],
            secretTypes: computed(() => get(state.providerObj, 'capability.supported_schema', [])),
        });

        const tabState = reactive({
            tabs: computed<TabItem[]>(() => [
                { label: vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.TAB_INPUT'), name: 'input', keepAlive: true },
                { label: vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.TAB_JSON'), name: 'json', keepAlive: true },
            ]),
            activeTab: 'input',
        });

        const formState = reactive({
            /* static input */
            accountName: undefined as undefined | string,
            accountNameInvalidText: computed(() => {
                let invalidText: TranslateResult = '';
                if (typeof formState.accountName === 'string') {
                    if (formState.accountName.length < 2) {
                        invalidText = vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_INVALID');
                    } else if (state.serviceAccountNames.includes(formState.accountName)) {
                        invalidText = vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_DUPLICATED');
                    }
                }
                return invalidText;
            }),
            isAccountNameValid: computed(() => {
                if (formState.accountName) {
                    return !(formState.accountName.length < 2 || state.serviceAccountNames.includes(formState.accountName));
                }
                return false;
            }),
            //
            tags: {},
            isTagsValid: true,
            //
            credentialName: undefined as undefined | string,
            credentialNameInvalidText: computed(() => {
                let invalidText: TranslateResult = '';
                if (typeof formState.credentialName === 'string') {
                    if (formState.credentialName.length < 2) {
                        invalidText = vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_INVALID');
                    } else if (state.credentialNames.includes(formState.credentialName)) {
                        invalidText = vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_DUPLICATED');
                    }
                }
                return invalidText;
            }),
            isCredentialNameValid: computed(() => {
                if (formState.credentialName) {
                    return !(formState.credentialName.length < 2 || state.credentialNames.includes(formState.credentialName));
                }
                return false;
            }),
            /* schema input */
            accountModel: {},
            accountSchema: {},
            isAccountModelValid: false,
            //
            credentialModel: {},
            credentialSchema: {},
            isCredentialModelValid: false,
            //
            jsonForCredential: '',
            //
            selectedProject: null as ProjectGroup|null,
            //
            isValid: computed(() => {
                if (tabState.activeTab === 'json') {
                    return formState.isAccountNameValid && formState.isAccountModelValid && formState.isCredentialNameValid;
                }
                return formState.isAccountNameValid && formState.isAccountModelValid && formState.isCredentialNameValid && formState.isCredentialModelValid;
            }),
        });

        const routeState = reactive({
            routes: computed(() => ([
                { name: vm.$t('MENU.IDENTITY.IDENTITY'), path: '/identity' },
                { name: vm.$t('MENU.IDENTITY.SERVICE_ACCOUNT'), path: '/identity/service-account' },
                { name: vm.$t('MENU.IDENTITY.SERVICE_ACCOUNT_ADD_ACCOUNT') },
            ])),
        });

        const getProvider = async () => {
            state.providerLoading = true;
            try {
                const [_, res] = await Promise.all([
                    vm.$store.dispatch('resource/provider/load'),
                    await SpaceConnector.client.identity.provider.get({
                        provider: props.provider,
                    }),
                ]);
                state.providerObj = res;
                state.selectedSecretType = res.capability.supported_schema[0];
            } catch (e) {
                console.error(e);
                state.providerObj = {};
                state.selectedSecretType = '';
            } finally {
                state.providerLoading = false;
            }
        };
        const getCredentialNames = async () => {
            const res = await SpaceConnector.client.secret.secret.list({
                only: 'name',
            });
            state.credentialNames = res.results.map(v => v.name);
        };
        const getServiceAccountNames = async () => {
            const res = await SpaceConnector.client.identity.serviceAccount.list({
                only: 'name',
            });
            state.serviceAccountNames = res.results.map(v => v.name);
        };
        const getServiceAccountSchema = async () => {
            formState.accountSchema = state.providerObj.template.service_account.schema;
        };
        const getCredentialSchema = async (selectedSecretType) => {
            const res = await SpaceConnector.client.repository.schema.get({
                name: selectedSecretType,
                only: ['schema'],
            });
            formState.credentialSchema = res.schema;
        };

        const deleteServiceAccount = async () => {
            await SpaceConnector.client.identity.serviceAccount.delete({
                service_account_id: state.serviceAccountId,
            });
            state.serviceAccountId = '';
        };
        const createServiceAccount = async () => {
            const item: any = {
                name: formState.accountName,
                provider: props.provider,
                data: formState.accountModel,
                tags: formState.tags,
            };

            if (formState.selectedProject) {
                item.project_id = formState.selectedProject.id;
            }
            try {
                const res = await SpaceConnector.client.identity.serviceAccount.create({
                    ...item,
                });
                state.serviceAccountId = res.service_account_id;
            } catch (e) {
                showErrorMessage(vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_TITLE'), e, vm.$root);
                console.error(e);
            }
        };
        const createSecretWithForm = async () => {
            await SpaceConnector.client.secret.secret.create({
                name: formState.credentialName,
                data: formState.credentialModel,
                schema: state.selectedSecretType,
                secret_type: 'CREDENTIALS',
                service_account_id: state.serviceAccountId,
                project_id: formState.selectedProject?.id || null,
            });
        };
        const createSecretWithJson = async (jsonData) => {
            await SpaceConnector.client.secret.secret.create({
                data: jsonData,
                name: formState.credentialName,
                schema: state.selectedSecretType,
                secret_type: 'CREDENTIALS',
                service_account_id: state.serviceAccountId,
                project_id: formState.selectedProject?.id || null,
            });
        };
        const createSecret = async () => {
            try {
                if (tabState.activeTab === 'json') {
                    try {
                        const json = JSON.parse(formState.jsonForCredential);
                        await createSecretWithJson(json);
                    } catch (e) {
                        console.error(e);
                        showErrorMessage(vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_TITLE'), e, vm.$root);
                        await deleteServiceAccount();
                        return;
                    }
                }
                if (tabState.activeTab === 'input') await createSecretWithForm();
                vm.$router.back();
                showSuccessMessage(vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_S_CREATE_ACCOUNT_TITLE'), '', vm.$root);
            } catch (e) {
                showErrorMessage(vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_TITLE'), e, vm.$root);
                await deleteServiceAccount();
            }
        };

        const onClickSave = async () => {
            if (!formState.isValid) {
                showErrorMessage(vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_TITLE'),
                    vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_FORM_INVALID'), vm.$root);
                return;
            }
            if (formState.isTagsValid) {
                await createServiceAccount();
                if (state.serviceAccountId) {
                    if (formState.credentialModel.private_key) {
                        formState.credentialModel.private_key = formState.credentialModel.private_key.replace(/\\n/g, '\n');
                    }
                    await createSecret();
                }
            }
        };
        const onClickGoBack = () => {
            const nextPath = vm?.$route.query.nextPath as string|undefined;
            if (nextPath) vm.$router.push(nextPath);
            else vm.$router.back();
        };


        watch(() => state.selectedSecretType, async (after, before) => {
            if (after && after !== before) {
                await getCredentialSchema(after);
            }
        }, { immediate: true });

        const init = async () => {
            await getProvider();
            await getServiceAccountNames();
            await getCredentialNames();
            //
            await getServiceAccountSchema();
        };
        init();

        return {
            ...toRefs(state),
            ...toRefs(formState),
            routeState,
            tabState,
            onClickSave,
            onClickGoBack,
        };
    },
};
</script>


<style lang="postcss" scoped>
.add-service-account-container {
    .page-title {
        @apply flex items-center;
        .icon {
            margin-right: 0.5rem;
        }
    }
    .p-pane-layout::v-deep {
        width: 100%;
        padding: 2rem 1rem;
        margin-bottom: 1rem;
        &:nth-last-child(1) {
            @apply mb-0;
        }
        .title {
            font-size: 1.5rem;
            line-height: 120%;
            margin-bottom: 2rem;
        }
        .tag-title {
            font-size: 0.875rem;
            font-weight: bold;
            line-height: 120%;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
        }
        .tag-help-msg {
            font-size: 0.875rem;
            line-height: 150%;
            margin-bottom: 1.5rem;
        }
        .p-field-group {
            .p-text-input {
                @screen lg {
                    max-width: 50%;
                }
            }
        }
        .secret-type-text {
            margin-right: 4.375rem;
        }
        .custom-schema-box {
            padding: 2rem 2rem 0 2rem;
        }
        .p-text-editor {
            .CodeMirror {
                font-family: Inconsolata, monospace;
                line-height: 1.5;
                height: 14.375rem;
                padding: 1rem;
                margin: 0 0 -2rem;
            }
        }
    }

    .tree-panel {
        width: 100%;
        padding: 2rem 1rem;
        margin-bottom: 1rem;
        &:nth-last-child(1) {
            margin-bottom: 0;
        }
    }

    .button-group {
        display: flex;
        flex-direction: row-reverse;
        margin-top: 1rem;
        .text-button {
            margin-left: 1rem;
        }
    }
}
</style>
