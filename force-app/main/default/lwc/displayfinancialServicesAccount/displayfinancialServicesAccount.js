import { LightningElement, wire,api,track} from 'lwc';
import getAccount from '@salesforce/apex/AccountClass.getAccount';
import getReAccount from '@salesforce/apex/AccountClass.getReAccount';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const columns = [
    { label: 'Name', fieldName: 'Name', type:'text', sortable: true,editable: true},
    {
        label: 'Account Owner',
        fieldName: 'AccountOwner',
        type:'text',
        sortable: true
    },
    { label: 'Phone', fieldName: 'Phone', type: 'phone',editable: true },
    { label: 'Website', fieldName: 'Website', type: 'url',editable: true },
    { label: 'AnnualRevenue', fieldName: 'AnnualRevenue', type: 'number',editable: true },
];

export default class DisplayfinancialServicesAccount extends LightningElement {
    @api title;
    @track data;
    error;
    searchKey='';
    @track orginalData;
    saveDraftValues = [];

    @wire(getAccount ,{industryType:'Financial Services'})
    wiredAccount({ error, data }) {
        if (data) {
            let currentData = [];
            data.forEach((row) => {
                let rowData = {};
                rowData.Name = row.Name;
                rowData.Phone = row.Phone;
                rowData.Website = row.Website;
                rowData.AnnualRevenue = row.AnnualRevenue;
                if (row.Owner) {
                    rowData.AccountOwner = row.Owner.Name;
                }
                rowData.Id = row.Id;
                currentData.push(rowData);
            });
            this.data = currentData;
            this.orginalData = currentData;
        } else if (error) {
            this.error = error;
            this.record = undefined;
        }
    };

    columns = columns;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;

    sortBy(field, reverse, primer) {
        const key = primer
            ? function(x) {
                  return primer(x[field]);
              }
            : function(x) {
                  return x[field];
              };

        return function(a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.data];
        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.data = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }

    handleKeywordChange(event){
        this.data = this.orginalData;
        this.searchKey = event.target.value;
        let filteredData = [];
        if(this.data && this.searchKey){
            for(let i=0; i<this.data.length; i++){
                if(this.data[i].Name.toLowerCase().includes(this.searchKey.toLowerCase())){
                    filteredData.push(this.data[i]);
                }
            }
            this.data = filteredData;
        }
        if(!this.searchKey){
            this.data =this.orginalData;
        }
    }

    handleSave(event) {
        this.saveDraftValues = event.detail.draftValues;
        const recordInputs = this.saveDraftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Records Updated Successfully!!',
                    variant: 'success'
                })
            );
            this.saveDraftValues = [];
            return this.refresh();
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'An Error Occured!!',
                    variant: 'error'
                })
            );
        }).finally(() => {
            this.saveDraftValues = [];
        });
    }

    async refresh() {
        //cannot refresh with refreshApex()
        let accountdata = await getReAccount({industryType:'Financial Services'});
        this.data = accountdata;

    }

}