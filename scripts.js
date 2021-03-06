
const Modal = {
  open() {
    // abrir modal
    document
      .querySelector('.modal-overlay')
      .classList.add("active")
  },
  close() {
    // fechar modal
    document
      .querySelector('.modal-overlay')
      .classList.remove("active")
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("Dev.Fiances:transactions")) || []
  },
  set(transaction) {
    localStorage.setItem("Dev.Fiances:transactions", JSON.stringify(transaction))
  }
}
const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction)

    App.reload()
  },

  remove(index) {
    Transaction.all.splice(index, 1)

    App.reload()
  },

  incomes() {
    let income = 0;
    Transaction.all.forEach(transaction => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    })
    return income;
  },

  expenses() {
    let expense = 0;
    Transaction.all.forEach(transaction => {
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    })
    return expense;
  },

  total() {
    return Transaction.incomes() + Transaction.expenses();
  }
}
const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : ""
    value = String(value).replace(/\D/g, "")

    value = Number(value) / 100

    value = value.toLocaleString("pt-br", {
      style: "currency",
      currency: "BRL"
    })
    return signal + value
  },
  formatAmount(value) {
    value = value * 100
    return Math.round(value)
  },
  formatDate(date) {
    const splitDate = date.split('-')
    return `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`
  }
}

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),
  addTransaction(transaction, index) {

    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction)
    tr.dataset.index = index
    DOM.transactionsContainer.appendChild(tr)
  },
  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? 'income' : 'expensive'
    const amount = Utils.formatCurrency(transaction.amount)
    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img onClick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transa????o">
      </td>
   
    `
    return html
  },
  updateBalance() {
    document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
    document.getElementById('expensiveDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
    document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
  },
  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ''
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValue() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    }
  },
  validateField() {
    const { amount, description, date } = Form.getValue()
    if (description.trim() === '' ||
      amount.trim() === '' ||
      date.trim() === '') {
      throw new Error("por favor, preencha todos os campos!")
    }

  },

  formatData() {
    let { amount, description, date } = Form.getValue()
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
      Form.validateField()
      const transaction = Form.formatData()
      Transaction.add(transaction)
      Form.clearFields()
      Modal.close()

    }
    catch (err) {
      alert(err.message)
    }

  }
}


const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction);
    DOM.updateBalance()
    Storage.set(Transaction.all)
  },
  reload() {
    DOM.clearTransactions()
    App.init()
  }
}

App.init()
