/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import store from "../__mocks__/store.js"
import Store from "../app/Store.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import { ROUTES ,ROUTES_PATH} from '../constants/routes.js'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI  from '../views/BillsUI.js'


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
  });
  describe("If I submit the form", () => {
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
  describe("If I submit the form", () => {
    it("Then test to get the bills (update)", async () => {
      const getSpy = jest.spyOn(store, "bills");
      const bills = store.bills();
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect((await bills.list()).length).toBe(4);
    });
    
    it("Then test to post the new bill with error", async () => {
      //handlesubmit
      //Using the methods create of store mock
      //expect the promise response send a 200 status and the bill

      const bill = {
        "billId":"47qAXb6fIm2zOKkLzMaaaro",
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

      const response = await store.bills().create({
        data: bill,
        headers: {
          noContentType: true
        }
      });
      expect(response.ok).toBe(200);

      // this.billId = key
      // this.fileUrl = fileUrl
      // this.fileName = fileName

      expect(response.message.billId).toBe(bill.billId); //47qAXb6fIm2zOKkLzMaaaro
      expect(response.message.fileUrl).toBe(bill.fileUrl); //public/a06d24f447b686c84f30f11722e7361b
      expect(response.message.fileName).toBe(bill.fileName); //test.png
    });




    it("Then test to post the new bill but can't reach the api server", async () => {
      //handlesubmit
      //Using the methods create of store mock
      //expect the promise response send a 404 status and an error
      const bill = {
        "billId":"47qAXb6fIm2zOKkLzMaaaro",
        "email": "employee@test.tld",
        "commentary": "test",
        "fileUrl": "public/a06d24f447b686c84f30f11722e7361b",
        "fileName": "test.png",
        "status": "pending"
      }
      store.bills.mockImplementationOnce((bill) => {
        return {
          create : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

        const html = BillsUI({ error: "Erreur 500" })
        document.body.innerHTML = html

        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()

    });
  });

})
