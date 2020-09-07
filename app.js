var budgetController =(function(){

    var Income = function(id,description,value){
        this.id=id;
        this.description=description;
        this.value = value;

    }
    var Expense = function(id,description,value){
        this.id=id;
        this.description=description;
        this.value = value;

    }
    var calculateTotal = function (type){
        var sum = 0;
        data.allItems[type].forEach(function (cur){
            sum+=cur.value;
        });  
        data.allTotals[type]= sum;
    };
    var data ={
        allItems: {
            exp:[],
            inc : []
        },
        allTotals:{
            exp:[], 
            inc:[]
        },
        budget :0,
        percentage:-1       
    };
    return {
        addItem:function(type,des,val){
            var newItem,ID;
            // create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            //  create new item based on 'inc' or 'exp' type
            if(type === 'exp'){
                newItem = new Expense (ID,des,val);   
            }else if(type === 'inc'){
                newItem = new Income(ID,des,val);
            }
            // push it into our data structure
            data.allItems[type].push(newItem);
            // return the new element
            return newItem;
        },
         
        
        deleteItem: function(type, id) {
            var ids, index;
            
            // id = 6
            //data.allItems[type][id];
            // ids = [1 2 4  8]
            //index = 3
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        
        calculateBudget : function(){
            // caculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate the budget : income - expenses
            data.budget = data.allTotals.inc - data.allTotals.exp;
            //  calculate the percentage of income that we spent
            if(data.allTotals.inc > 0)
            {data.percentage= Math.round(( data.allTotals.exp /data.allTotals.inc)*100);}
            else {
                data.percentage = -1;
                
            }

             

        },
        getBudget :function(){
            return {
                budget: data.budget,
                totalInc: data.allTotals.inc,
                totalexp: data.allTotals.exp,
                percentage: data.percentage
            }
        },
        
        testing: function() {
            console.log(data);
        }
    }
    
})();

 var UIController =(function(){
     var DOMstrings={
         inputType: '.add__type',
         inputDescription: '.add__description',
         inputValue:'.add__value',
         inputBtn : '.add__btn',
         incomeContainer : '.income__list',
         expensesContainer:'.expenses__list',
         budgetLabel:'.budget__value',
         incomeLabel:'.budget__income--value',
         expenseLabel:'.budget__expenses--value',
         percentageLabel:'.budget__expenses--percentage',
         container:'.container',
         dateLabel:'.budget__title--month'


     };

    return {
         getInput : function(){
             return { 
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat( document.querySelector(DOMstrings.inputValue).value)
         };
        },

        addListItem: function(obj,type){
            var html,newHtml,element;
            // create html string with placeholder txt
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

           } else if(type === 'exp'){
                element = DOMstrings.expensesContainer;
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'  
            }

            //  replace the place holder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);


        },
        clearFields : function (){
            var fieldsArr,fields;
            fields = document.querySelectorAll( DOMstrings.inputDescription+','+DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fields.forEach(function(current,index,array){
                current.value= "";
            });
            fieldsArr[0].focus();
        },
        displayBudget: function(obj){
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expenseLabel).textContent = obj.totalexp;
            if(obj.percentage > 0)
           { document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage+"%";
        }
        else
        {
             document.querySelector(DOMstrings.percentageLabel).textContent ="---";
            
        } 

        },
        displaymonth : function(){
            var now,year,month,months;
            now = new  Date();
            year = now.getFullYear();
            months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month]+' '+year;

        },

       
    getDOMstrings: function(){
            return DOMstrings;
        }
    }

 })();
// global app controller

 var controller = (function(budgetCtrl,UICtrl){

     var setupEventListeners =function() {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress',function(event){
            if (event.keycode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem); 
     }
     var updateBudget = function(){
        // 1. calculate the budget
        budgetCtrl.calculateBudget();

        // 2: return the budget
        var budget = budgetCtrl.getBudget();

        // 3. display the budget on the Ui
        UICtrl.displayBudget(budget);
     }
     
     var ctrlAddItem = function (){
        var input,newItem;
        //  1. get the field input data 
        input = UICtrl.getInput();
        
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();
          
        }   
   
     };

     var ctrlDeleteItem = function(event){
        var itemId,splitId,type,ID;
          itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
       if(itemId){ 
        // inc-1
        splitId= itemId.split('-');
        type=splitId[0];
        ID = parseInt(splitId[1],10);

        // 1. delete the item from the data structure
        budgetCtrl.deleteItem(type,ID);

        // 2. delete the item from the UI
        UICtrl.deleteListItem(itemId);

        // 3. Update the shoe the new budget
        updateBudget();

    }
       
    }
    return {
       init: function(){
           console.log("application working");
           UICtrl.displaymonth();
           UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalexp: 0,
            percentage:-1
        }
        )
            setupEventListeners();
           

        }
    }      
 })(budgetController,UIController);

 controller.init();