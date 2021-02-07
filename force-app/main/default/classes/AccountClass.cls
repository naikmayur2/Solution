public  with sharing class AccountClass {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccount(String industryType){
        return [Select Id,Name,Owner.Name, Phone, Website, AnnualRevenue from Account where Industry =:industryType];
    }
    
    //Temporary method - to be removed
    @AuraEnabled
         public static List<Account> getReAccount(String industryType){
        return [Select Id,Name,Owner.Name, Phone, Website, AnnualRevenue from Account where Industry =:industryType];
    }
    
}