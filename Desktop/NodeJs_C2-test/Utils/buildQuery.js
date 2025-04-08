module.exports = {
    QueryProduct : function (objQuery){
        console.log(objQuery);
        let result = {};
        if(objQuery.name){
          result.productName = new RegExp(objQuery.name,'i');
        }
        result.price={}
        if(objQuery.price){
          if(objQuery.price.$gte){
            result.price.$gte=Number(objQuery.price.$gte);
          }else{
            result.price.$gte=0;
          }
          if(objQuery.price.$lte){
            result.price.$lte=Number(objQuery.price.$lte);
          }else{
            result.price.$lte=9999;
          }
        }else{
          result.price.$gte=0;
          result.price.$lte=9999;
        }
        console.log(result);
        return result;
      },
    QueryUser: function (objQuery) {
      console.log(objQuery);
      let result = {};

      if (objQuery.username) {
        result.username = new RegExp(objQuery.username, 'i');
      }
      if (objQuery.email) {
        result.email = new RegExp(objQuery.email, 'i');
      }
      if (objQuery.status) {
        result.status = objQuery.status === 'true'; 
      }

      result.loginCount = {};
      if (objQuery.loginCount) {
        if (objQuery.loginCount.$gte) {
          result.loginCount.$gte = Number(objQuery.loginCount.$gte);
        } else {
          result.loginCount.$gte = 0;
        }
        if (objQuery.loginCount.$lte) {
          result.loginCount.$lte = Number(objQuery.loginCount.$lte);
        } else {
          result.loginCount.$lte = 9999;
        }
      } else {
        result.loginCount.$gte = 0;
        result.loginCount.$lte = 9999;
      }
      console.log(result);
      return result;
    }
}