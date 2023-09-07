import ClientCommunications from './reports/ClientCommunications';
import CompanyCommunications from './reports/CompanyCommunications';
import CompanyFilterTab from './reports/CompanyFilterTab';

const client_communications = {
    component: ClientCommunications,
    el: '#client-communications'
}

const company_communications = {
    component: CompanyCommunications,
    el: '#company-communications'
}

const company_filter_tab = {
    component: CompanyFilterTab,
    el: '#company-filter-tab'
}

const components = [
    client_communications,
    company_communications,
    company_filter_tab
];

export default components;