export default [
  {
    question: "What should I track?",
    answer: `That's really up to you. But, you can't go wrong tracking your 
				mood a couple times a day, and each time you drink water. From there, you'll start to see what 
				else you might want to track and understand.`,
  },
  {
    question: "Can I order my trackers?",
    answer: `On the Track view, tap the ••• icon in the upper right, then select "Manage this tab"`,
  },
  {
    question: "Can I delete a tracker off the main screen?",
    answer:
      "Only if you want to delete that tracker from Nomie. You can always recreate it, and the data you tracked with that tracker will remain. Only the tracker button will be deleted.",
  },
  {
    question: "When should I track?",
    answer: `That's really up to you too, but the key is to keep it balanced, 
				track a few times throughout the day maybe?`,
  },
  {
    question: `Where's my data stored?`,
    answer: `If you went with the cloud option, your data is stored encrypted in Blockstack's instance of GaiaHub. 
				The only person able to decrypt your data is you. If you picked local storage, then your data is stored 
				in the browser that's running this instance of Nomie.`,
  },
  {
    question: `Can I host my own data?`,
    answer: `Yes! If you're technical search "Blockstack DigitalOcean GaiaHub" and follow the instructions.
				This will direct you to Blockstack where you'll set your own GaiaHub storage`,
  },
  {
    question: `Can the Nomie API export data from Nomie?`,
    answer: `No, the API is only for pulling content INTO Nomie. To get your data out, either use the Backup or CSV Export methods.`,
  },
  {
    question: `What are the limits of Nomie's API?`,
    answer: `You get 10 slots to store data to push into Nomie. When Nomie imports a record, it will be removed, freeing up the slot. 
    I do this to ensure people don't go hog wild like they did with Nomie 2 and 3's API`,
  },
  {
    question: `Can I auto import things into this version of Nomie?`,
    answer: `Yes! Using the Nomie API, or by using a custom URL parameter. If you add "/?note=Hi" to the end of any Nomie URL - it will create a note. Apps like Tasker (Android) and 
				Shortcuts in iOS can open web browsers. So you url encode a note with the 
				data you need. For example: #water(34)`,
  },
  {
    question: `Why create Nomie?`,
    answer: `Because I (@brandoncorbin) need it.`,
  },
];
