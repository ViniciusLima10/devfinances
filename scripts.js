// Adicionar modal/ remover modal
const Modal = {
    openModal() {
        // abrir modal
        //Adicionar a class active ao modal
        document.querySelector('.modal-overlay')
            .classList
            .add('active')
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
    }
}       



const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

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

        startDate= document.querySelector('input#startDate').value
        finalDate= document.querySelector('input#finalDate').value
        App.reload(startDate, finalDate)
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
        App.reload(startDate, finalDate)
    },

    incomes() {
        let income = 0;
        Transaction.all.forEach(transaction => {
            if( transaction.amount > 0 ) {
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if( transaction.amount < 0 ) {
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${transaction.identifier})" src="./assets/minus.svg" alt="Remover transação">
        </td>
        `

        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
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
    index: document.querySelector('input#index'),


    filterMinAmount: document.querySelector('input#minAmountFilter'),
    filterMaxAmount: document.querySelector('input#maxAmountFilter'),
    filterDate: document.querySelector('input#dateFilter'),

    

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()
        
        if( description.trim() === "" || 
            amount.trim() === "" || 
            date.trim() === "" ) {
                throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()
        
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()
            const transaction = Form.formatValues()
            Transaction.add(transaction)
            Form.clearFields()
            Modal.closeModal()
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
    totalLightbackground()
}
themeSwitcher.addEventListener("click", clickHandler);

window.onload = checkTheme();
window.onload = totalImg();


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
    var balanceValue = Transaction.total()
    const localStorageTheme = localStorage.getItem("theme");
    if (localStorageTheme !== null && localStorageTheme === "dark" && balanceValue < 0 ){
        totalImagem = './assets/negativedarktotal.svg'
    }else {
        totalImagem = './assets/darktotal.svg'
    }

}

function totalLightbackground () {
    var balanceValue = Transaction.total()
    const localStorageTheme = localStorage.getItem("theme");
    if (localStorageTheme !== null && localStorageTheme === "light" && balanceValue < 0 ){
        document.getElementById('totalcard').style.backgroundColor = '#e92929'
    }else {
        document.getElementById('totalcard').style.backgroundColor = ''
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


function filtrar () {
    startDate=document.querySelector('input#startDate').value
    finalDate=document.querySelector('input#finalDate').value
    App.reload(startDate,finalDate)

}
const App = {
    init(startDate, finalDate) {
        console.log(startDate)
        console.log(finalDate)
        newTransactions=[]
        



        indexTransaction=0
        while(indexTransaction<Transaction.all.length){
            dateTransaction=Transaction.all[indexTransaction].date
            dateInParts = dateTransaction.split('/')
            dateToCheck=dateInParts[2]+'-'+dateInParts[1]+'='+dateInParts[0]
            insertTransaction=true


            if (startDate!='' && dateToCheck<startDate){
                insertTransaction = false
            }
            if (finalDate!='' && dateToCheck>finalDate){
                insertTransaction = false
            }
            if (insertTransaction){
                newTransactions.push(Transaction.all[indexTransaction])
            }
            indexTransaction++;
        }

        newTransactions.forEach(DOM.addTransaction)
        DOM.updateBalance()
        Storage.set(Transaction.all)
        balanceCheck()
        window.onload = balanceCheck()
        window.onload = totalImg()
        setTimeout(totalLightbackground(), 3000)
    },
    reload(startDate, finalDate) {
        DOM.clearTransactions()
        App.init(startDate, finalDate)
    },
}

App.init('', '')
