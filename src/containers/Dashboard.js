import { formatDate } from '../app/format.js'
import DashboardFormUI from '../views/DashboardFormUI.js'
import BigBilledIcon from '../assets/svg/big_billed.js'
import { ROUTES_PATH } from '../constants/routes.js'
import USERS_TEST from '../constants/usersTest.js'
import Logout from "./Logout.js"

export const filteredBills = (data, status) => {
  return (data && data.length) ?
    data.filter(bill => {
      let selectCondition

      // in jest environment
      if (typeof jest !== 'undefined') {
        selectCondition = (bill.status === status)
      }
      /* istanbul ignore next */
      else {
        // in prod environment
        const userEmail = JSON.parse(localStorage.getItem("user")).email
        selectCondition =
          (bill.status === status) &&
          ![...USERS_TEST, userEmail].includes(bill.email)
      }

      return selectCondition
    }) : []
}

export const card = (bill) => {
  const firstAndLastNames = bill.email.split('@')[0]
  const firstName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[0] : ''
  const lastName = firstAndLastNames.includes('.') ?
  firstAndLastNames.split('.')[1] : firstAndLastNames

  return (`
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `)
}

export const cards = (bills) => {
  return bills && bills.length ? bills.map(bill => card(bill)).join("") : ""
}

export const getStatus = (index) => {
  switch (index) {
    case 1:
      return "pending"
    case 2:
      return "accepted"
    case 3:
      return "refused"
  }
}

export default class {
  constructor({ document, onNavigate, store, bills, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    $('#arrow-icon1').click((e) => this.handleShowTickets(e, bills, 1))
    $('#arrow-icon2').click((e) => this.handleShowTickets(e, bills, 2))
    $('#arrow-icon3').click((e) => this.handleShowTickets(e, bills, 3))
    new Logout({ localStorage, onNavigate })
  }


  handleShowTickets(e, bills, index) {
    console.info(bills)
    console.info(index);
    //bills = liste de tout les bills
    //index = je suppose que c'est la categorie || le numero de la flèche en gros #arrow-icon

    if (this.counter === undefined || this.index !== index) this.counter = 0 //sert à definir si on ouvre ou ferme la categorie
    if (this.index === undefined || this.index !== index) this.index = index // index sur la categorie actuelle


    if (this.counter % 2 === 0) { //si on ouvre la categorie
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(0deg)'}) // on tourne la flèche
      $(`#status-bills-container${this.index}`) // on affiche les tickets
        .html(cards(filteredBills(bills, getStatus(this.index)))) //a se renseigner plus tard eventuellement

      this.counter ++ // on incremente le compteur pour savoir si on ouvre ou ferme la categorie
    } 
    else //si on ferme la categorie
    { 
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(90deg)'}) //on ferme la categorie
      $(`#status-bills-container${this.index}`) //on vide la categorie basé sur l'iundex
        .html("")
      this.counter ++ // on incremente le compteur pour savoir si on ouvre ou ferme la categorie
    }


    bills.forEach(bill => {
      $(`#open-bill${bill.id}`).click((e) => this.handleEditTicket(e, bill, bills))
    })

    return bills

  }
  handleEditTicket(e, bill, bills) {
    e.stopImmediatePropagation();
    console.log("handleEditTicket")
    console.log("ancien id", this.id);
    console.log("ancien compteur", this.counter_bill);

    if (this.counter_bill === undefined || this.id !== bill.id) this.counter_bill = 0 //initialise un compteur pour detecter le nombre de clic sur un ticket
    console.log("nouveau compteur", this.counter_bill);

    if (this.id === undefined || this.id !== bill.id) this.id = bill.id //Initialise un id s'il n'existe pas ou si l'id actuelle est differente de l'id du ticket
    console.log("Nouvel id",this.id);


    if (this.counter_bill % 2 === 0) {
      bills.forEach(b => {//Applique un css a tout les tickets
        $(`#open-bill${b.id}`).css({ background: '#0D5AE5' })
      })
      //le billet cliqué aura un background noir
      $(`#open-bill${bill.id}`).css({ background: '#2A2B35' })

      //on remplit la div avec le contenu du ticket clické
      $('.dashboard-right-container div').html(DashboardFormUI(bill))
      //css pour le ticket cliqué
      $('.vertical-navbar').css({ height: '150vh' })
    } else { //si on ferme le ticket on reset le css et on affiche une icone
      $(`#open-bill${bill.id}`).css({ background: '#0D5AE5' })

      $('.dashboard-right-container div').html(`
        <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
      `)
      $('.vertical-navbar').css({ height: '120vh' })
    }
    //counter_bill incremente pour savoir si on ouvre ou ferme le ticket
    this.counter_bill ++
    console.log("--------------------")

    $('#icon-eye-d').click(this.handleClickIconEye)
    $('#btn-accept-bill').click((e) => this.handleAcceptSubmit(e, bill))
    $('#btn-refuse-bill').click((e) => this.handleRefuseSubmit(e, bill))
  }

  handleAcceptSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'accepted',
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'refused',
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  handleClickIconEye = () => {
    const billUrl = $('#icon-eye-d').attr("data-bill-url")
    const imgWidth = Math.floor($('#modaleFileAdmin1').width() * 0.8)
    $('#modaleFileAdmin1').find(".modal-body").html(`<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} alt="Bill"/></div>`)
    if (typeof $('#modaleFileAdmin1').modal === 'function') $('#modaleFileAdmin1').modal('show')
  }

  getBillsAllUsers = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
        .map(doc => ({
          id: doc.id,
          ...doc,
          date: doc.date,
          status: doc.status
        }))
        return bills
      })
      .catch(error => {
        throw error;
      })
    }
  }

  // not need to cover this function by tests
  /* istanbul ignore next */
  updateBill = (bill) => {
    if (this.store) {
    return this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: bill.id})
      .then(bill => bill)
      .catch(console.log)
    }
  }
}
