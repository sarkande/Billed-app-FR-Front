/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import store from "../app/Store.js"

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
  // describe("If I upload a new file", () => {
  //   it("The file should be uploaded only if is extension is correct", () => {
  //     const fileName = "file.jpg"
  //     const onNavigate = null;
  //     const localStorage = window.localStorage;
  //     const bills =  new NewBill({ document, onNavigate, store, localStorage })
  //     expect(bills.checkExtension(fileName)).toBe(true);
  //   });
  // });

  //check if file not null
})
