/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES ,ROUTES_PATH} from '../constants/routes.js'
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"

jest.mock("../app/store", () => mockStore)


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
      const bills =  new NewBill({ document, onNavigate, mockStore, localStorage })
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

    it("Then i test to handle submit", async() => {

      //INIT
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'employee@test.tld'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const html = NewBillUI()
      document.body.innerHTML = html

      const checkExtension = jest
          .spyOn(NewBill.prototype, 'checkExtension')


      const newBill = new NewBill({document,
        onNavigate,
        mockStore,
        localStorage: window.localStorage});

      //TEST

      const handleChange = jest.fn((e)=>newBill.handleChangeFile(e));
      
      const inputFile = screen.getByTestId(`file`);
      console.info(inputFile)
      inputFile.addEventListener("change", handleChange);
      const file = new File(["file"], "file.png", {type: "image/png"});

      fireEvent.change(inputFile,
        { 
          target:{ 
            files:
              [ file]
          } 
        });
      console.info(inputFile.files[0])

      expect(handleChange).toHaveBeenCalled();
      expect(checkExtension).toHaveBeenCalled();
      //checkExtension not correct
      expect(document.querySelector(".file-error").classList.contains("active")).toBe(false);
      console.info(newBill)

      // expect(newBill.billId).toBe("file.jpg");
      // expect(newBill.fileUrl).toBe("file.jpg");
      // expect(newBill.bilfileNamelId).toBe("file.jpg");

    });
    
  });



  describe("If I submit the form", () => {

    it("Then the field should not be null", () => {
      //handleSubmit
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };


      const localStorage = window.localStorage;
      const bills =  new NewBill({ document, onNavigate, mockStore, localStorage })
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


    it("Then test to get the bills (update)", async () => {
      const getSpy = jest.spyOn(mockStore, "bills");
      const bills = mockStore.bills();
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
        "fileUrl": "https://localhost:3456/images/test.jpg",
        "fileName": "test.png",
        "status": "pending"
      }

      const response = await mockStore.bills().create({
        data: bill,
        headers: {
          noContentType: true
        }
      });
      

      // this.billId = key
      // this.fileUrl = fileUrl
      // this.fileName = fileName

      expect(response.fileUrl).toBe(bill.fileUrl); //public/a06d24f447b686c84f30f11722e7361b

    });


    it("Then test to post the new bill but the api server return an error 500", async () => {
      //handlesubmit
      //Using the methods create of store mock
      //expect the promise response send a 500 status and an error

      mockStore.bills.mockImplementationOnce(() => {
        return {
          create : (bill) =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
        const bill = {
          "billId":"47qAXb6fIm2zOKkLzMaaaro",
          "email": "employee@test.tld",
          "pct": 30,
          "commentary": "test",
          "fileUrl": "public/a06d24f447b686c84f30f11722e7361b",
          "fileName": "test.png",
          "status": "pending"
        }
  
        const response = await mockStore.bills().create({
          data: bill,
          headers: {
            noContentType: true
          }
        }).catch((error) => error);
        
        document.body.innerHTML = response
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()

    });

    it("Then test to post the new bill but can't reach the api server", async () => {
      //handlesubmit
      //Using the methods create of store mock
      //expect the promise response send a 500 status and an error

      mockStore.bills.mockImplementationOnce(() => {
        return {
          create : (bill) =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
        const bill = {
          "billId":"47qAXb6fIm2zOKkLzMaaaro",
          "email": "employee@test.tld",
          "pct": 30,
          "commentary": "test",
          "fileUrl": "public/a06d24f447b686c84f30f11722e7361b",
          "fileName": "test.png",
          "status": "pending"
        }
  
        const response = await mockStore.bills().create({
          data: bill,
          headers: {
            noContentType: true
          }
        }).catch((error) => error);

        document.body.innerHTML = response
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()

    });



   

    // const onNavigate = (pathname) => {
    //   document.body.innerHTML = ROUTES({ pathname });
    // };
    // const updateBillMock = jest
    //   .spyOn(NewBill.prototype, 'updateBill')
    //   .mockImplementation((bill) => {
    //     console.log('fonction simulée');
    //     if (mockStore) {
    //       mockStore
    //       .bills()
    //       .update(bill)
    //       .then(() => {
    //         onNavigate(ROUTES_PATH['Bills'])
    //       })
    //       .catch(error => console.error(error))
    //     }
    //  });


  });






})
