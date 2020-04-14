/* eslint-disable camelcase */
import {
    CreateAction,
    GetAction,
    ListAction,
    MemberListAction,
    Resource,
    ResourceActions,
    SingleDeleteAction,
    SingleItemMemberListAction,
    SubMultiItemAction,
    SubMultiItemAddAction,
    TreeAction,
    UpdateAction,
} from '@/lib/fluent-api/toolset';
import {
    ListType, ProjectGroupInfo, Tags, TimeStamp,
} from '@/lib/fluent-api/type';

const idField = 'project_id';

interface IdParameter {
    [idField]: string;
}

export interface ProjectModel extends IdParameter, Tags{
    name: string;
    state: string;
    project_group_info: ProjectGroupInfo;
    providers?: string[];
    created_by: string;
    created_at: TimeStamp;
    deleted_at: TimeStamp;
}

export type ProjectListResp = ListType<ProjectModel>

interface CreateParameter extends Tags {
    name: string;
}
interface UpdateParameter extends Tags, IdParameter {
    name: string;
}

class Create extends CreateAction<CreateParameter, any> {}
class Update extends UpdateAction<UpdateParameter, any> {}
class Delete extends SingleDeleteAction<IdParameter, any> {
    protected idField = idField;
}
class Get extends GetAction<IdParameter, ProjectModel> {
    protected idField = idField;
}

interface ProjectListParameter {
    include_provider: boolean;
}
class List extends ListAction<ProjectListParameter, ProjectListResp> {
    setIncludeProvider(val = true) {
        this.apiState.extraParameter.include_provider = val;
        return this.clone();
    }
}

class MemberList extends SingleItemMemberListAction<any, any> {
    protected idField = idField;
}

interface ProjectTreeParameter {
    include_project: boolean;
}

class Tree extends TreeAction<ProjectTreeParameter, any> {
    setExcludeProject(val = true) {
        return val ? this.setExcludeType('PROJECT') : this.setExcludeType('');
    }
}

abstract class MemberAction extends SubMultiItemAction<any, any> {
    idField = idField;

    protected subIdsField = 'users';
}

class AddMember extends MemberAction {
    path = 'member/add'
}

class RemoveMember extends MemberAction {
    path = 'member/remove'
}

export default class Project extends Resource implements ResourceActions<'create'|'update'|'delete'|'get'|'list'|'memberList'|'tree'|'addMember'|'removeMember'> {
    protected name = 'project';

    create() { return new Create(this.baseUrl); }

    update() { return new Update(this.baseUrl); }

    delete() { return new Delete(this.baseUrl); }

    get() { return new Get(this.baseUrl); }

    list() { return new List(this.baseUrl); }

    memberList() { return new MemberList(this.baseUrl); }

    tree() { return new Tree(this.baseUrl); }

    addMember() { return new AddMember(this.baseUrl); }

    removeMember() { return new RemoveMember(this.baseUrl); }
}
