/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import store from "../__mocks__/store.js";
import userEvent from '@testing-library/user-event'

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
       expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    
    test("Then click on billIcon should display a modal", async ()=>{
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      document.body.innerHTML = BillsUI({ data: bills })
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const Store = null;
      const billInstantiate = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      const modale = document.getElementById('modaleFile')
      $.fn.modal = jest.fn(() => modale.classList.add("show"));
      const handleClickIconEye = jest.fn(()=> billInstantiate.handleClickIconEye);

      
      const iconEye = screen.getAllByTestId('icon-eye')[0]
      expect(iconEye).toBeTruthy()

      iconEye.addEventListener("click", handleClickIconEye);


      userEvent.click(iconEye)
      expect(handleClickIconEye).toHaveBeenCalled()
    

      expect(modale.classList).toContain("show");

    })

    // test("Then click on new bill button should allow to navigate to the new bill", async()=>{
    //   //todo write test
    // })

    test("Then bill should be render", async()=>{
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const billInstantiate = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      
      const getAllBills = jest.fn(()=> billInstantiate.getBills());
      var result = await getAllBills();

      expect(getAllBills).toHaveBeenCalled();
      expect(result.length).toBe(4)

    })
  })
})
