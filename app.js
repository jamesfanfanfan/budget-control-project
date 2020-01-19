    /*
    * we use the controller to connect the rest two parts which
    * are separated from outside
    * */

    var budgetController = (function () {

        var expense = function (id, description,value) { //object(function) constructor
            this.id = id;
            this.description = description;
            this.value = value;
        };

        expense.prototype.calPercent = function (inc) {
            this.percentage = (inc===0?-1:Math.floor(this.value*100/inc));
        };

        expense.prototype.getpercent = function () {
            return this.percentage;
        };

        var income = function (id, description,value) {
            this.id = id;
            this.description = description;
            this.value = value;
        };

        var calculate_total = function(type){
            var sum = 0;
            data.AllItem[type].forEach(function (cur) {
                sum+=cur.value;
            });

            data.total[type] = sum;
        };

        var data = {// is almost same as the [][]

            total : {
              exp : 0,
              inc : 0
            },

            AllItem : {
                exp: [],
                inc: []
            },

            percentage : 0,

            budget : 0
        }


        return {

            add_item: function (type, des, val) {

                var new_item, ID;

                ID = data['AllItem'][type].length === 0 ? 0 : data.AllItem[type][data.AllItem[type].length - 1].id + 1;

                if (type === 'exp') {
                    new_item = new expense(ID, des, val);
                } else {
                    new_item = new income(ID, des, val);
                }

                data.AllItem[type].push(new_item);


                return new_item;
            },
            calperc : function(){
                data.AllItem.exp.forEach(function (cur) {
                    console.log("datainc "+data.total.inc);
                    cur.calPercent(data.total.inc);
                })
            },

            getperce : function(){
                var store = data.AllItem.exp.map(function (cur) {
                    return cur.getpercent();
                });

                return store;
            },

            calculate_budget: function () {
                calculate_total('inc');
                calculate_total('exp');
                data.budget = data.total.inc - data.total.exp;

                if (data.total.inc <= 0) {
                    data.percentage = -1;
                } else {
                    data.percentage = Math.floor((data.total.exp) / data.total.inc * 100);

                }
            },

            delete_Item : function(type,ID){
                var store = data.AllItem[type].map(function (current) {
                    return current.id;
                });
                var idx = store.indexOf(ID);

                if(idx!==1){
                    data.AllItem[type].splice(idx,1);
                }
            },

            getBudget : function() {

                return {
                    bud : data.budget,
                    per : data.percentage,
                    total_exp : data.total.exp,
                    total_inc : data.total.inc
                }
            },

            testing : function () {
                console.log(data);
            }
        }



    })();

    var UIController = (function () {
        var DomStrings = {
            type_box : ".add__type",
            description_box : ".add__description",
            add_value_box : '.add__value',
            add_btn : ".add__btn",
            income_list : '.income__list',
            expense_list : '.expenses__list',
            budget_income : ".budget__income--value",
            budget_expenses :".budget__expenses--value",
            budget_percentage : ".budget__expenses--percentage",
            budget_value : ".budget__value",
            delete_target: ".container",
            percentage_label : ".item__percentage"
        };


        var formater = function (num,type) {

            num = Math.abs(num);
            num = num.toFixed(2);
            var numssplit = num.split('.');
            var len = numssplit[0].length;
            var sb = numssplit[0];
            if(len>3){
                console.log('fuckk');
                sb = numssplit[0].substr(0,len-3)+',' +numssplit[0].substr(len-3,3);
            }
            return (type === 'exp'?'-':'+')+sb+'.'+numssplit[1];

        };







        return {

            time_update : function(){
                var date = new Date();
                var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

                var month = months[date.getMonth()];

                var year = date.getFullYear();

                document.querySelector('.budget__title--month').textContent = month+' '+year;
            },

            get_input : function () {
                return {
                    type : document.querySelector(DomStrings.type_box).value,
                    description : document.querySelector( DomStrings.description_box).value,
                    value : parseFloat(document.querySelector(DomStrings.add_value_box).value)
                };
            },

            addListItem : function(obj, type) {// put the expense, and name on the website
                var html, new_html, element;
                //create html string with placeholder text
                if(type === 'exp'){
                    element = DomStrings.expense_list;
                    html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }else{
                    element = DomStrings.income_list;
                    html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }

                // replace the placeholder with actual data
                new_html = html.replace('%id%',obj.id);
                new_html = new_html.replace('%description%',obj.description);
                new_html = new_html.replace('%value%',formater(obj.value,type));
                // insert the html into the dom
                document.querySelector(element).insertAdjacentHTML('beforeend', new_html);

            },

            deleteListItem : function(ID){
                var ele;
                ele = document.getElementById(ID);
                document.getElementById(ID).parentNode.removeChild(ele);//very wired
            },

            clear_place : function () {//every time we add sth this function would be called
                var fields = document.querySelectorAll(DomStrings.description_box+','+DomStrings.add_value_box);
                var arrFields = Array.prototype.slice.call(fields);
                //do call back function in the foreach;
                arrFields.forEach(function (current) {
                    current.value = "";
                });

                arrFields[0].focus(); //move the guang_biao back to the description place
            },

            display_budget : function(obj){
                console.log("obj "+obj);
                var type = obj.bud<0?'exp':'inc';
                document.querySelector(DomStrings.budget_value).textContent = formater(obj.bud,type);
                document.querySelector(DomStrings.budget_expenses).textContent = formater(obj.total_exp,'exp');
                document.querySelector(DomStrings.budget_income).textContent = formater(obj.total_inc,'inc');
                if(obj.per > 0){
                    document.querySelector(DomStrings.budget_percentage).textContent = obj.per+' %';
                }else{
                    document.querySelector(DomStrings.budget_percentage).textContent = '---';
                }
            },


            display_percentage : function(percent){
                var field  = document.querySelectorAll(DomStrings.percentage_label);

                function nodelistforeach(list,callback) {
                    for(var i=0;i<list.length;i++){
                        callback(list[i],i);
                    }
                };

                nodelistforeach(field,function (cur,ind) {
                    (percent[ind]<=0 )? '---':cur.textContent = percent[ind]+'%';
                });

            },
            get_string : function () {
                return DomStrings;
            }


        }
    })();

    var controller = (function (budgetCtrl,UICtrl) {

        var event_listener = function () {
            var dom_string = UICtrl.get_string();

            document.querySelector(dom_string.add_btn).addEventListener('click',  ctrlAddItem);

            document.addEventListener('keypress',function (event) {
                if(event.keyCode===13||event.which===13){
                    ctrlAddItem();
                }
            });
            document.querySelector(dom_string.delete_target).addEventListener("click",ctrlDeleteItem);
        };


        var update_budget = function () {
            budgetCtrl.calculate_budget();

            var value = budgetCtrl.getBudget();

            console.log(value.per,value.total_inc);
            UICtrl.display_budget(value);

        };//it would be used for multiple times

        var update_percent = function () {
            //1. calculate the percent in the budget_ctrl;
            budgetCtrl.calperc();

            //2. get the percentage
            var store = budgetCtrl.getperce();
            console.log(store);
            //3. display the num on the UI_controller

            UICtrl.display_percentage(store);
        };

        var ctrlDeleteItem = function(event){
            var item_id = event.target.parentNode.parentNode.parentNode.parentNode.id;

            var splitID,type,ID;
            console.log("item_id "+item_id);
            if(item_id){
                splitID = item_id.split("-");
                type = splitID[0];
                ID = parseInt(splitID[1]);

                //1. delete the item from the data structure
                budgetCtrl.delete_Item(type,ID);

                //2. display the deletion on the ui controller
                UICtrl.deleteListItem(item_id);

                //3. update the budget
                update_budget();

                //4. update percentage
                update_percent();
            }else{

                update_budget();

                update_percent();
            }

        };
        var ctrlAddItem = function(){

            //get the input from the UI
            var input = UICtrl.get_input();
            if(input.description !== "" && !isNaN(input.value) && input.value != 0){

                //add the input into budgeControl

                var obj = budgetCtrl.add_item(input.type,input.description,input.value);

                //budgetCtrl.testing();
                //put the expense into the website


                UICtrl.addListItem(obj, input.type);

                //remove the description and number in the placeholder
                UICtrl.clear_place();

                update_budget();

                //remove the expense or income from the website
                //update percentage on the expense when add something
                update_percent();
            }


        };

        return {
            init : function () {
                console.log('storage session');
                UICtrl.display_budget({
                    bud : 0,
                    total_exp: 0,
                    total_inc: 0,
                    per: '---'
                });
                event_listener();
                UICtrl.time_update();

            }
        }

    })(budgetController,UIController);

    controller.init();