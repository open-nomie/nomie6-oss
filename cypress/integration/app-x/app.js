/// <reference types="Cypress" />

context("App", () => {
  beforeEach(() => {});

  const visit = () => {
    cy.visit("http://localhost:5000");
    cy.wait(1000);
  };
  const onboard = () => {
    cy.visit("http://localhost:5000");
    cy.wait(1000);
    cy.get(".layout-footer .n-toolbar .nbtn").eq(0).click();
    cy.wait(200);
    cy.get(".layout-footer .n-toolbar .nbtn").eq(0).click();
    cy.wait(200);
    cy.get(".layout-footer .n-toolbar .nbtn").eq(1).click();
    cy.wait(400);
    cy.get(".layout-footer .n-toolbar .nbtn").eq(1).click();
    cy.wait(400);
    cy.get(".layout-footer .n-toolbar .nbtn").eq(1).click();
    cy.wait(400);
    cy.get(".top > :nth-child(3)").click();
    cy.wait(400);
    cy.get(".layout-footer .n-toolbar .nbtn").eq(1).click();
    cy.wait(1000);
  };

  const selectStarters = () => {
    cy.get(".tracker-mood").click();
    cy.wait(200);
    cy.get(".tracker-sleep").click();
    cy.wait(200);
    cy.get(".tracker-water").click();
    cy.wait(200);
    cy.get(".tracker-pooped").click();
    cy.wait(200);
    cy.get(".tracker-sex").click();
    cy.wait(200);
    cy.get(".tracker-sleep_quality").click();
    cy.wait(200);
    cy.get('.library-modal > .n-modal > .n-modal-footer > [slot="footer"] > .nbtn').click();
    cy.wait(300);
    // cy.get(".left > .btn > .n-icon").click();
  };

  const trackWater = () => {
    cy.get(".tracker-water").click();
    cy.wait(500);
    cy.get(".r-0.b-0").click();
    cy.get(".r-3.b-0").click();
    cy.wait(300);
    cy.get(".r-3.b-0").click();
    cy.get(".main > .nbtn").click();
    cy.wait(600);
  };

  const startTimer = () => {
    cy.get(".tracker-sleep").click();
    cy.wait(500);
    cy.get('.main > .nbtn-success').click();
  };

  

  const trackMood = (addOrSave = "save") => {
    cy.get(".tracker-mood").click();
    cy.wait(1000);
    cy.get(".tracker-input.slider input").as("range").invoke("val", 8).trigger("change");
    cy.wait(400);
    if (addOrSave == "save") {
      cy.get(".main > .nbtn").click();
      cy.wait(400);
    } else {
      cy.get(".right .nbtn").eq(2).click();
    }
    // cy.get(".n-modal-footer > .footer > .btn-primary").click();
  };


  const useTrackers = () => {
    trackWater();
    trackMood();
    startTimer();
  };

  const testTips = () => {
    cy.wait(400);
    cy.get(".n-tips > .mx-auto > :nth-child(5) > .n-icon").click();
    cy.wait(100);
    cy.get(".n-tips > .mx-auto > :nth-child(5) > .n-icon").click();
    cy.wait(100);
    cy.get(".n-tips > .mx-auto > :nth-child(5) > .n-icon").click();
    cy.wait(100);
    cy.get(".n-tips > .mx-auto > :nth-child(5) > .n-icon").click();
    cy.wait(100);
    cy.get(".n-stepper > :nth-child(5)").should("have.class", "active");
    // Click the close button
    cy.get('.n-tips .mx-auto > :nth-child(4)').click();
    cy.wait(100);
    cy.get(".visible > .alert-dialog-window > .p-1 > .nbtn-primary").click();
  };

  const testCaptureForm = () => {
    goHome();
    cy.get("#textarea-capture-note").type("#sample #data #mood(6)");
    cy.get(".save-button").click();
    cy.wait(200);
    cy.get("#textarea-capture-note").should("contain.value", "");
  };

  const testHistory = () => {
    cy.get(".tab-History").click();
    cy.wait(400);
  };

  const enableFeatures = () => {
    cy.get(".tab-Settings").eq(0).click();
    cy.wait(200);
    // Enable People
    cy.get("[name=onoffswitch]").eq(0).type("true", { force: true });
    cy.wait(200);
    // Enable Dashboard
    cy.get("[name=onoffswitch]").eq(1).type("true", { force: true });
    cy.wait(200);
    // Go back home
    cy.get(".tab-Track").click();

    cy.wait(200);
  };

  const testDashboard = () => {
    cy.wait(200);
    cy.get(".tab-Dash").click();
    cy.wait(400);
    // Click on the Add Widghet
    cy.get('.empty-box > .nbtn').click();
    cy.wait(100);
    cy.get("select").eq(0).select("barchart");
    cy.wait(100);
    cy.get("select").eq(1).select("this-week");
    cy.wait(300);
    cy.get('[slot="right"] > .n-text').click();
    cy.wait(200);
    // Select Trackers
    cy.get('.pop-button-0').click();
    cy.wait(1000);
    // Select mood
    cy.get(".n-modal-body .list .n-item").eq(2).click();
    // click done
    cy.wait(200);
    cy.get('.n-modal-footer > .n-row > .nbtn-primary').click();
    cy.wait(200);
    // hit save
    cy.get('.n-modal-frame.visible > .n-modal > .n-modal-header > .n-toolbar-grid > .right > .nbtn').click();
    cy.wait(1000);
  };

  const longPressTracker = (tag) => {
    cy.wait(100);
    cy.get(`.tracker-${tag}`).trigger("mousedown");
  };

  const testDeleteingTracker = () => {
    appTab('Track');
    cy.wait(700);
    cy.get('.tracker-sex > .nbtn').click({force: true});
    cy.wait(700);
    // Click Remove...
    // cy.get('.pop-button-3').click();
    cy.get(':nth-child(3) > .pop-button-1').click();
    cy.wait(400);
    // Hit Cancel first -- to see if this gets deleted
    cy.get(".visible > .alert-dialog-window > .p-1 > .nbtn-transparent").click();
    cy.wait(500);
    cy.get(".trackers").then((node) => {
      expect(node.html().search(".tracker-sex")).to.be.gt(-1);
    });
    cy.wait(500);
    cy.get('.tracker-sex > .nbtn').click({force: true});
    cy.wait(400);
    // Click Remove
    cy.get(':nth-child(3) > .pop-button-1').click();
    cy.wait(400);
    cy.get(".visible > .alert-dialog-window > .p-1 > .nbtn-primary").click();
    cy.wait(600);
    cy.get(".trackers").then((node) => {
      expect(node.html().search(".tracker-sex")).to.be.eq(-1);
    });
  };

  const testPin = (shouldBeValid = true) => {
    cy.get(".tab-Settings").click();
    cy.wait(1000);
    cy.get(".features .toggle-pin-button").click();
    cy.wait(1000);

    cy.get('.keypad > :nth-child(1)').click();
    cy.get('.keypad > :nth-child(2)').click();
    cy.get('.keypad > :nth-child(3)').click();
    cy.get('.keypad > :nth-child(5)').click();
    // submit 
    cy.get('.keypad > :nth-child(12)').click();
    cy.wait(400);
    /// CONFIRM INCORRECTLY 
    cy.get('.keypad > :nth-child(1)').click();
    cy.get('.keypad > :nth-child(2)').click();
    cy.get('.keypad > :nth-child(3)').click();

    if(shouldBeValid) {
      cy.get('.keypad > :nth-child(5)').click();
    } else {
      cy.get('.keypad > :nth-child(4)').click();
    }

    // submit 
    cy.get('.keypad > :nth-child(12)').click();
    cy.wait(400);

    if(!shouldBeValid) {
      cy.get('.visible > .alert-dialog-window > .p-1 > .nbtn').click();  
    } else {
      cy.get(".features .toggle-pin-button").then(node=>{
        expect(node).to.contain('Disable');
      });
    }

  };

  const initBasic = () => {
    window.localStorage.clear();
    window.indexedDB.deleteDatabase("localforage");
    onboard();
    selectStarters();
  };

  const exportData = () => {
    cy.get(".tab-Settings").click();
    cy.wait(400);
  };

  const testPerson = () => {
    // Type
    cy.get("#textarea-capture-note").type("hello there @bob, I hope you are well! Also, let's add @billy, @frank and @chunk");
    cy.get(".save-button").click();
    cy.get(".tab-People").click();
    cy.wait(400);
    // Tap on the check-in for the person created
    
    cy.get('.trackers > :nth-child(1)').click();
    cy.wait(400);
    cy.get(".person-checkin textarea").type(" and I are going to test +nomie!");
    // Select a positivity
    cy.get(".n-positivity-selector > :nth-child(4)").click();
    cy.get(".person-checkin > .nbtn-block").click();
    cy.wait(2000);
    // Click the person check in again.
    cy.get('.trackers > :nth-child(1)').click();
    cy.wait(400);
    // View Logs
    cy.get(".person-modal .n-modal-header .nbtn-group .nbtn").eq(0).click();
    cy.get(".person-modal .log-list-loader > .n-list")
      .find(".n-item")
      .then((listing) => {
        // const count = Cypress.$(listing).length;
        expect(listing).to.contain("@bob");
      });
    // Close modal
    cy.get('[slot="left"] > .nbtn').click();
    cy.wait(400);
    goHome();
  };

  const testTabs = () => {
    appTab('Track');
    cy.wait(500);
    // Click tab icon
    cy.get('.board-option-action').click();
    // cy.get("header > .n-toolbar-grid > .right > .nbtn").click();
    cy.wait(300);
    //  click add a tab
    cy.get(':nth-child(3) > .pop-button-1').click();
    cy.wait(300);
    cy.get(".form-control").type("Test Tab");
    cy.wait(100);
    cy.get(".visible > .alert-dialog-window > .p-1 > .nbtn-primary").click();
    cy.wait(400);

    // Click Add Button
    cy.get('.empty-box > .nbtn').click();
    cy.wait(300);
    cy.get(".pop-menu button").eq(0).click();
    cy.wait(400);
    
    cy.get('.tracker-selector-modal .select-item').eq(0).click();
    cy.wait(400);
    cy.get('.tracker-selector-modal .select-item').eq(1).click();
    cy.wait(400);
    cy.get('.tracker-selector-modal .select-item').eq(2).click();
    cy.wait(400);
    cy.get('.n-modal-footer > .n-row > .nbtn-primary').click();
    // cy.wait(400);
    // cy.get(".tracker-water").then((node) => {
    //   expect(node.text()).to.contain("Drank Water");
    // });
    cy.wait(500);
    appTab('Track');
    // cy.get(".board-all").click();
  };

  const trackCreatedTracker = (options={}) => {
    cy.get(`.tracker-${options.tag}`).click();
  
    if(options.one_tap) {
      // Done
    } else {

    }
  }

  const createTracker = (options={})=>{
    appTab('Track');
    // Click Add Tracker
    cy.get('.tracker-add > .item-ball').click();
    cy.wait(200);
    // click create a tracker in pop menu
    cy.get('.pop-button-0').click();
    cy.wait(200);
    cy.get('.n-tracker-editor .emoji-editor input').type(options.emoji || '🎭');
    const label = options.label || `Test ${options.type || 'Tracker'}`;
    cy.get('.n-tracker-editor .tracker-label input').type(label)

    options.type = options.type || "tick"
    options.tag = label.replace(/ /g,'_').toLowerCase();
    // open advanced 
    cy.get('.advanced-toggler').click();
    cy.wait(200);

    // Open the Tracker Type Selector
    cy.get('.tracker-type').click();
    cy.wait(400);

    switch(options.type) {
      case 'tick':
        cy.get('.pop-button-0').click();
        cy.wait(400);
        if(options.one_tap) {
          cy.get('.tracker-one-tap .onoffswitch').click();
          
        }
      break

      case "value":
        cy.get('.pop-button-1').click();
        cy.wait(100);
      break;

      case "range":
        cy.get('.pop-button-2').click();
        cy.wait(100);
      break;

      case "picker":
        cy.get('.pop-button-3').click();
        cy.wait(100);
      break;

      case "timer":
        cy.get('.pop-button-4').click();
        cy.wait(100);
      break;

      case "note":
        cy.get('.pop-button-5').click();
        cy.wait(100);
        cy.get('.tracker-note > .n-input-wrapper textarea').type(options.note)
      break;
    }

    if(options.math) {
      cy.get('.tracker-math > .n-input-wrapper > .n-input > select').select(options.math);
    }

    if(options.default) {
      cy.get('.tracker-default input').type(options.default);
    }

    cy.wait(300);
    // Save Button
    cy.get('.n-tracker-editor > .n-modal-frame > .n-modal > .n-modal-header > .n-toolbar-grid > .right').click();

    appTab('Track');

    // trackCreatedTracker(options);
      
    
  }

  const trackAndEditRecord = () => {

    const textToAdd = `plus some from the edit`;

    goHome();
    cy.get('#textarea-capture-note').type("This is a test note for #editing +context @person");
    cy.wait(100);
    // Click Positivity 
    cy.get('.positivity-emoji-btn').click();
    cy.wait(100);
    // Set positivity 
    cy.get('.n-positivity-selector > :nth-child(5)').click();
    cy.wait(100);
    // click save
    cy.get('.nbtn-success').click();
    appTab('History');
    // select ***
    cy.get('.time-row > .nbtn').click();
    cy.wait(100);
    // Select Edit
    cy.get(':nth-child(3) > .pop-button-0').click();
    cy.wait(100);
    cy.get('.form-control').then(node=>{
      let html = `${node.text()} - ${textToAdd}`;
      cy.get('.form-control').type(html);
    })
   
  

    cy.wait(200);
    // // Click Save
    cy.get('[slot="right"] > .nbtn').click();
    cy.wait(1000);


    goHome();

  };

  const goHome = async () => {
    return cy.get(".tab-Track").click();
  };

  const appTab = async (tabName) => {
    cy.wait(100);
    cy.get(`.tab-${tabName}`).click();
    cy.wait(100);
  };


  const tests = [
    {
      it: "should onboard with localstorage",
      run: initBasic,
    },
    { it: "should delete a tracker", run: testDeleteingTracker },
    {
      it: "should track, and edit a record",
      run: trackAndEditRecord,
    },
    { it: "should enable features", run: enableFeatures },
    {
      it: "should create a tally tracker",
      run: ()=>{
        return createTracker({
          type: 'tick',
          label: "Tick Tracker",
          emoji: "🏄‍♀️",
          one_tap: true
        })
      }
    },
    {
      it: "should create a value tracker",
      run: ()=>{
        return createTracker({
          type: 'value',
          label: "Value Tracker",
          emoji: "💰",
          default: 12
        })
      }
    },
    {
      it: "should create a note tracker",
      run: ()=>{
        return createTracker({
          type: 'note',
          label: "Note Tracker",
          emoji: "📒",
          note: "#value_tracker #tick_tracker"
        })
      }
    },
    {
      it: "should create a timer tracker",
      run: ()=>{
        return createTracker({
          type: 'timer',
          label: "Timer Tracker",
          emoji: "⏰"
        })
      }
    },
    
    { it: "Should properly track using the tracker buttons", run: useTrackers },
    // { it: "should test adding a tab", run: testTabs },
    { it: "should test a bad pin PIN", run: ()=>{ testPin(false) } },
    { it: "should test a good pin PIN", run: ()=>{ testPin(true) } },
    { it: "should be able to create a log via a note", run: testCaptureForm },
    { it: "Should properly test the tips", run: testTips },
    { it: "Should properly handle adding a person via a note", run: testPerson },
    { it: "should test the dashboard", run: testDashboard },
    { it: "should have all the things in history", run: testHistory },
  ];
  

  tests.forEach((test)=>{
    it(test.it, ()=>test.run())
  })