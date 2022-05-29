/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import store from "../app/Store.js"
import {localStorageMock} from "../__mocks__/localStorage.js";

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
    })
  })
  //check extension
  describe("If I upload a new file", () => {
    it("Then the file extension should be correct", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const fileExtensionTest =["file.jpg", "file.jpeg", "file.png"]
      const fileExtensionTestFalse =["file.jpga", "file.pdf", "png"]

      const localStorage = window.localStorage;
      const bills =  new NewBill({ document, onNavigate, store, localStorage })
      const html = NewBillUI()
      document.body.innerHTML = html
      
      for (let index = 0; index < fileExtensionTest.length; index++) {
        const element = fileExtensionTest[index];
        expect(bills.checkExtension(element)).toBe(true);
      }  
      
      for (let index = 0; index < fileExtensionTestFalse.length; index++) {
        const element = fileExtensionTestFalse[index];
        expect(bills.checkExtension(element)).toBe(false);
      }  

    });
    it("Then the field should not be null", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };


      const localStorage = window.localStorage;
      const bills =  new NewBill({ document, onNavigate, store, localStorage })
      const html = NewBillUI()
      document.body.innerHTML = html
      const bill = {
        "email": "employee@test.tld",
        "type": "Restaurants et bars",
        "name": "vol espagne",
        "amount": 250,
        "date": "2022-05-12",
        "vat": "70",
        "pct": 30,
        "commentary": "test",
        "fileUrl": "public/a06d24f447b686c84f30f11722e7361b",
        "fileName": "test.png",
        "status": "pending"
      }
      const billFalse = {
        "email": "",
        "type": "",
        "name": "",
        "amount": 250,
        "date": null,
        "vat": "70",
        "pct": 30,
        "commentary": "test",
        "fileUrl": "",
        "fileName": "",
        "status": "pending"
      }


      expect(bills.checkFieldsNotNull(Object.entries(bill))).toBe(true);
      expect(bills.checkFieldsNotNull(Object.entries(billFalse))).toBe(false);
    });
  });

  //check if file not null
})
