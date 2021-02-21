// Adicionar modal/ remover modal
const Modal = {
    openModal(formType, index) {
        // abrir modal
        //Adicionar a class active ao modal
        Form.formSettings(formType)
        Form.formValues(formType, index)
        if(formType == 'simple' || formType == 'edit' || formType == 'view'){
            document.querySelector('.modal-overlay')
            .classList
            .add('active')
        }else if (formType == 'filter'){
            document.querySelector('.filter-overlay')
            .classList
            .add('active')
        }

    },
    closeModal() {
        // Fechar modal
        //Remover a class active do modal
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    },

    openFilter() {
        // abrir modal
        //Adicionar a class active ao modal
        document.querySelector('.filter-overlay')
            .classList
            .add('active')
    },
    closeFilter() {
        // Fechar modal
        //Remover a class active do modal
        document
            .querySelector('.filter-overlay')
            .classList
            .remove('active')
    },
}       

const Storage = {
    get(storage) {
        if (storage=='transaction'){
            return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
        }
        else if (storage=='filter'){
            return JSON.parse(localStorage.getItem("dev.finances:filter")) || []
        }
    },

    set(storage, value) {
        if (storage=='transaction'){
            localStorage.setItem("dev.finances:transactions", JSON.stringify(value))
        }
        else if (storage=='filter'){
            localStorage.setItem("dev.finances:filter", JSON.stringify(value))
        }
    },
    delete(target){
        if (target=='filter'){
            localStorage.removeItem("dev.finances:filter")
        }
    }
}

const Transaction = {
    all: Storage.get('transaction'),


    add(transaction){

        if(Transaction.all.length==0){
            identifier = 1
        }else{
            identifier = Transaction.all[Transaction.all.length-1].identifier+1
        }
        newTransaction={
            'description':transaction.description,
            'amount':transaction.amount,
            'date':transaction.date,
            'identifier': identifier
        }

        Transaction.all.push(newTransaction)
        App.reload()
    },

    edit(transaction){
        indexPosition = Transaction.selectIndexPosition(transaction)
        Transaction.all.splice(indexPosition, 1, transaction)
        return Transaction.all
    },

    remove(identifier) {
        
        indexSelect = 0
        while (indexSelect<Transaction.all.length) {
            if(Transaction.all[indexSelect].identifier==identifier){
                break
            }
            indexSelect++;
        }

        Transaction.all.splice(indexSelect, 1)

        startDate= document.querySelector('input#startDate').value
        finalDate= document.querySelector('input#finalDate').value
        App.reload()
    },

    select(indexTransaction){
        indexSelect=0
        while(indexSelect<Transaction.all.length){
            if(Transaction.all[indexSelect].identifier == indexTransaction){
                return Transaction.all[indexSelect]
            }
            indexSelect++
        }
    },

    selectIndexPosition(transaction){
        indexSelect=0
        while(indexSelect<Transaction.all.length){
            if(Transaction.all[indexSelect].identifier == indexTransaction){
                return indexSelect
            }
            indexSelect++
        }
    },

    incomes(newTransactions) {
        let income = 0;
        newTransactions.forEach(transaction => {
            if( transaction.amount > 0 ) {
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses(newTransactions) {
        let expense = 0;
        newTransactions.forEach(transaction => {
            if( transaction.amount < 0 ) {
                expense += transaction.amount;
            }
        })
        return expense;
    },


    total(newTransactions) {
        filter = localStorage.getItem("dev.finances:filter")
        return Transaction.incomes(newTransactions) + Transaction.expenses(newTransactions);
    }
}

const Filter = {
    update(filter){
        Storage.delete('filter')
        Storage.set('filter', filter) 
    },

    select(){
        filter=Storage.get('filter')
        return filter
    },
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        tr.setAttribute('id', `transaction${index}`)
        DOM.transactionsContainer.appendChild(tr)

    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)
        const date = Utils.formatDate(transaction.date)


        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${date}</td>
        <td>
        <a href="#" onclick="Modal.openModal('edit', ${transaction.identifier})"><i class="far fa-edit"></i></a>
        </td>
        <td>
            <img  onclick="Transaction.remove(${transaction.identifier})" src="./assets/minus.svg" alt="Remover transação">
        </td>
        `
        
        return html
    },

    updateBalance(newTransactions) {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes(newTransactions))
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses(newTransactions))
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total(newTransactions))
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value) {
        value = Number(value) * 100;
    
        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`    
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

       return signal + value
    }
}


const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    edit: document.querySelector('input#edit'),


    startDate: document.querySelector('input#startDate'),
    finalDate: document.querySelector('input#finalDate'),

    formSettings(formType) {
        if(formType == 'simple' || formType == 'edit') {
            document.getElementById('description').disabled = false
            document.getElementById('amount').disabled = false
            document.getElementById('date').disabled = false
        }
        else if(formType == 'view') {
            document.getElementById('description').disabled = true
            document.getElementById('amount').disabled = true
            document.getElementById('date').disabled = true
        }
    },

    formValues(formType, index) {
        if(formType=='simple'){
            document.getElementById('title').innerHTML='Nova Transação'
        }else if(formType=='edit' || formType=='view') {
            transaction=Transaction.select(index)
            document.getElementById('description').value=transaction.description
            document.getElementById('amount').value=transaction.amount/100
            document.getElementById('date').value=transaction.date
            document.getElementById('edit').value=transaction.identifier
        }else if (formType=='filter'){
            filter=Filter.select()

            document.getElementById('startDate').value=String(filter.startDate)
            document.getElementById('finalDate').value=String(filter.finalDate)
        }

    },

    getValues(formType) {
        if (formType=='transaction'){
            return {
                description: Form.description.value,
                amount: Form.amount.value,
                date: Form.date.value,
                identifier: Form.edit.value
            }
        }
        else if (formType=='filter'){
            return {
                startDate: Form.startDate.value,
                finalDate: Form.finalDate.value,
            }
        }

    },

    validateFields(formType) {
        if (formType=='transaction'){
            const { description, amount, date } = Form.getValues(formType)
            
            if( description.trim() === "" || 
                amount.trim() === "" || 
                date.trim() === "" ) {
                    throw new Error("Por favor, preencha todos os campos")
            }
        }
        else if (formType=='filter'){
            const { startDate, finalDate} = Form.getValues(formType)

            if (startDate!='' && finalDate!='' && startDate>finalDate){
                throw new Error("Por favor, a data final deve ser superior a data inicial.")
            }
        }
        
    },

    formatValues(formType) {
        if (formType=='transaction'){
            let { description, amount, date, identifier } = Form.getValues(formType)
            
            amount = Utils.formatAmount(amount)

            return {
                description,
                amount,
                date,
                identifier
            }
        }
        else if (formType=='filter'){
            const { startDate, finalDate} = Form.getValues(formType)
            
            return {
                startDate,
                finalDate
            }
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
        Form.edit.value = ""
        
        Form.startDate.value = ""
        Form.finalDate.value = ""
    },

    submit(event, formType) {
        event.preventDefault()
        try {
            Form.validateFields(formType)
            const form = Form.formatValues(formType)
            if (formType=='transaction'){
                if(form.identifier==''){
                    Transaction.add(form)
                }else if(form.identifier!=''){
                    Transaction.edit(form)
                }
                Modal.closeModal()
            }
            else if (formType=='filter'){
                filter=Filter.select()
                filter={
                    'startDate': form.startDate,
                    'finalDate': form.finalDate,
                }
                Filter.update(filter)
                Modal.closeFilter()
            }
            Form.clearFields()
            App.reload()
        } catch (error) {
            alert(error.message)
        }
    }
}
// function para mudar img
function alterarImagem(objeto, caminhoNovaImagem){
    
    document.getElementById(objeto).src = caminhoNovaImagem; 
    
}    


// theme switcher             
const themeSwitcher = document.getElementById("theme-switch");

themeSwitcher.checked = false;
function clickHandler() {
    if (this.checked) {
        document.body.classList.remove("light");
        document.body.classList.add("dark");
        localStorage.setItem("theme", "dark");
    } else {
        document.body.classList.add("light");
        document.body.classList.remove("dark");
        localStorage.setItem("theme", "light");
    }
    totalImg()
    totalLightbackground(newTransactions)
}
themeSwitcher.addEventListener("click", clickHandler);

// window.onload = checkTheme();
// window.onload = totalImg();


function checkTheme() {
    const localStorageTheme = localStorage.getItem("theme");

    if (localStorageTheme !== null && localStorageTheme === "dark") {
        // set the theme of body
        document.body.className = localStorageTheme;

        // adjust the slider position
        const themeSwitch = document.getElementById("theme-switch");
        themeSwitch.checked = true;
    }
}

// implementando interatividade no card total
var totalImagem = './assets/total.svg'
function balanceCheck() {
    var balanceValue = Transaction.total(newTransactions)
    const localStorageTheme = localStorage.getItem("theme");
    if (localStorageTheme !== null && localStorageTheme === "dark" && balanceValue < 0 ){
        totalImagem = './assets/negativedarktotal.svg'
    }else {
        totalImagem = './assets/darktotal.svg'
    }
    return totalImagem
}

function totalLightbackground (newTransactions) {
    var balanceValue = Transaction.total(newTransactions)
    const localStorageTheme = localStorage.getItem("theme");
    document.getElementById('totalcard').style.backgroundColor = ''
    if (localStorageTheme !== null && localStorageTheme === "light" && balanceValue < 0 ){
        document.getElementById('totalcard').style.backgroundColor = '#e92929'
    }
        
    
}

function totalImg() {
    const localStorageTheme = localStorage.getItem("theme");
    var totalSvg = document.getElementById('imgtotal');
    balanceCheck()
    if (localStorageTheme !== null && localStorageTheme === "dark") {
        // set img of total

        totalSvg.src = totalImagem

    }else {
        totalSvg.src = './assets/total.svg'
    }
}


function filterClear() {
    // Form.submit(event,'filter')
    filter=Filter.select()
    newFilter={
        'startDate':'',
        'finalDate':''
    }
    Filter.update(newFilter)
    filter = newFilter
    App.reload()
}

const App = {
    init() {
        
        filter=Filter.select()
        if(filter.length==0){
            newFilter={
                'startDate':'',
                'finalDate':''
            }
            Filter.update(newFilter)
            filter=newFilter
        }
        newTransactions=[]
        indexTransaction=0

        while(indexTransaction<Transaction.all.length){
            dateTransaction=Transaction.all[indexTransaction].date
            insertTransaction=true
            if (filter.startDate!='' && dateTransaction<filter.startDate){
                insertTransaction = false
            }
            if (filter.finalDate!='' && dateTransaction>filter.finalDate){
                insertTransaction = false
            }
            if (insertTransaction){
                newTransactions.push(Transaction.all[indexTransaction])
            }
            indexTransaction++;
        }

        checkTheme()
        newTransactions.forEach(DOM.addTransaction)
        DOM.updateBalance(newTransactions)
        Storage.set('transaction', Transaction.all)
        totalImg()
        setTimeout(totalLightbackground(newTransactions), 1)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()