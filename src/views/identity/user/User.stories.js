import { action } from '@storybook/addon-actions';
import User from './User.template';
import { mockUserList } from '@/views/identity/user/models/user-model';
import PStatus from '@/components/molecules/status/Status';
import BaseDragHorizontal from '@/components/base/drag/BaseDragHorizontal';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable';
import PButton from '@/components/atoms/buttons/Button';

export default {
    title: 'page/identity/user',
    component: User,
    parameters: {
        info: {
            summary: '',
            components: { User },
        },
    },
};
const actions = {
    rowLeftClick: action('rowLeftClick'),
    rowRightClick: action('rowRightClick'),
    rowMiddleClick: action('rowMiddleClick'),
    rowMouseOver: action('rowMouseOver'),
    rowMouseOut: action('rowMouseOut'),
    clickRefresh() {
        return action('clickRefresh')
    },
};


export const template = () => ({
    template: `
    <div class="animated fadeIn">
        <BaseDragHorizontal>
            <template #container="{ height }">
                <p-toolbox-table
                    :items="items"
                    :fields="fields"
                    :selectable="true"
                    :sortable="true"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    :all-page="allPage"
                    :this-page.sync="thisPage"
                    :select-index.sync="selectIndex"
                    :page-size.sync="pageSize"
                    :responsive-style="{'height': height+'px', 'overflow-y':'auto'}"
                    :setting-visible="false"
                    @changePageSize="changePageSize"
                    @changePageNumber="changePageNumber"
                    @clickRefresh="clickRefresh"
                >
                    <template slot="toolbox-left">
                        <p-button
                            style-type="primary"
                            @click="clickAdd"
                        >
                            <p-i name="ic_plus" color="transparent white" :fill="true" /> Create
                        </p-button>
                        <p-dropdown
                            :menu="dropdown"
                            @click-update="clickUpdate"
                            @click-delete="clickDelete"
                            @click-activated="clickActivated"
                            @click-deactivated="clickDeactivated"
                        >
                            Actions
                        </p-dropdown>
                    </template>
                    <template slot="col-state" slot-scope="data">
                        <p-td>
                            {{ data.state }}
                            <p-status
                                v-if="data.state==='ENABLED'"
                                icon="fa-circle"
                                icon-style="solid"
                                size="xs"
                                text="enabled"
                                icon-color="#60B731"
                            />
                            <p-status
                                v-else
                                icon="fa-circle"
                                icon-style="solid"
                                size="xs"
                                text="disabled"
                                icon-color="#EA390F"
                                text-color="#EA390F"
                            />
                        </p-td>
                    </template>
                </p-toolbox-table>
            </template>
        </BaseDragHorizontal>
        <div>
            this is empty
        </div>
    </div>`,
    components: {
        PStatus,
        BaseDragHorizontal,
        PToolboxTable,
        PButton,
    },
    mixins: [User],
    data() {
        return {
            items: mockUserList(15),
        };
    },
});
