import React from "react";
import './App.css';
import Othello from './components/othello.js';
import {
  createSmartappDebugger,
  createAssistant,
} from "@salutejs/client";
import "./App.css";


const initializeAssistant = (getState/*: any*/) => {
  if (process.env.NODE_ENV === "development") {
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? "",
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
      getState,
    });
  }
  return createAssistant({ getState });
};


export class App extends React.Component {
  static single_instance;
  constructor(props) {
    super(props);
    console.log('constructor');
    App.single_instance = this;
    this.state = {
      notes: [],
    }

    this.assistant = initializeAssistant(() => this.getStateForAssistant() );
    this.assistant.on("data", (event/*: any*/) => {
      console.log(`assistant.on(data)`, event);
      const { action } = event
      this.dispatchAssistantAction(action);
    });
    this.assistant.on("start", (event) => {
      console.log(`assistant.on(start)`, event);
    });

  }

  componentDidMount() {
    console.log('componentDidMount');
  }

  getStateForAssistant () {
    console.log('getStateForAssistant: this.state:', this.state)
    const state = {
      item_selector: {
        items: this.state.notes.map(
          ({ id, title }, index) => ({
            number: index + 1,
            id,
            title,
          })
        ),
      },
    };
    console.log('getStateForAssistant: state:', state)
    return state;
  }

  // блок методов

  dispatchAssistantAction (action) {
    console.log('dispatchAssistantAction', action);
    if (action) {
      switch (action.type) {

        case 'undo_choose':
          return this.undo_choose(action);

        case 'colour_choose':
          return this.colour_choose(action);

        case 'mode_choose':
          return this.mode_choose(action);

        case 'newgame_choose':
          return this.newgame_choose(action);

        case 'hint_choose':
          return this.hint_choose(action);

        case 'move_choose':
            return this.move_choose(action);

        default:
          throw new Error();
      }
    }
  }

  colour_choose (action) {
    console.log('colour_choose', action);
    document.getElementById("switchColour").click();
  }

  mode_choose (action) {
    console.log('mode_choose', action);
    document.getElementById("switchMode").click();
  }

  newgame_choose (action) {
    console.log('newgame_choose', action);
    document.getElementById("switchGame").click();
  }

  hint_choose (action) {
    console.log('hint_choose', action);
    document.getElementById("switchHint").click();
  }

  undo_choose (action) {
    console.log('undo_choose', action);
    document.getElementById("switchUndo").click();
  }

  move_choose (action) {

    console.log('move_choose', action);
    console.log(action.note[0]["text"]);
    const text_arr = action.note[0]["text"].split(" ");
    console.log(text_arr);
    const wrd = {0: ["а", "эй"], 1: ["б", "бэ", "би"], 2: ["цэ", "ц"], 3: ["дэ", "д", "ди"], 4: ["е","и"], 5: ["ф", "эф", "фи"], 6: ["джи","жэ","ж","гэ","г"],
    7 :["х","хэ","эйч","ха", "аш"] };
    const num = {1: ["1", "один"], 2: ["2", "два"], 3: ["3", "три"], 4: ["4", "четыре"], 5: ["5", "пять"], 6: ["6", "шесть"], 7: ["7", "семь"],
    8 :["8", "восемь"] };
    let x = -1;
    for(let i=0; i<8; i++){
      for(let j=0; j<wrd[i].length; j++)
        if(text_arr[0] == wrd[i][j]){
            x = i;
        }
    }

    let y = -1;
    for(let i=1; i<9; i++){
      for(let j=0; j<num[i].length; j++)
        if(text_arr[1] == num[i][j]){
            y = i;
        }
    }

    console.log(Othello.result)
    document.getElementById(y.toString()+x.toString()).click();
    console.log(Othello.result)
    if (Othello.result != -2){
      if (Othello.flag == 1){
        this._send_action("Yesmove", {'note' : action.note});
      };
      if (Othello.flag == 0){
        this._send_action("Nomove", {'note' : action.note});
      };
    }

    if (Othello.result == 0){
      this._send_action("Black", {'note' : action.note});
      Othello.result = -1;
    };
    if (Othello.result == 1){
      this._send_action("White", {'note' : action.note});
      Othello.result = -1;
    };
    if (Othello.result == 2){
      this._send_action("Draw", {'note' : action.note});
      Othello.result = -1;
    };
  }

  _send_action(action_id, value) {
    const data = {
      action: {
        action_id: action_id,
        parameters: { 
          value: value,
        }
      }
    };
    const unsubscribe = this.assistant.sendData(
      data,
      (data) => {
        const {type, payload} = data;
        console.log('sendData onData:', type, payload);
        unsubscribe();
      });
  }

  send_act(action){
    if (action == 0){ 
      this._send_action("Black", {'note' : "By_click"});
      Othello.result = -2;
    }
    if (action == 1){ 
      this._send_action("White", {'note' : "By_click"})
      Othello.result = -2;
    }
    if (action == 2){ 
      this._send_action("Draw", {'note' : "By_click"})
      Othello.result = -2;
    }
    if (action == "Noundo"){ 
      this._send_action("Noundo", {'note' : "By_click"})
    }
    if (action == "Yesundo"){ 
      this._send_action("Yesundo", {'note' : "By_click"})
    }
  }
  render() {
    console.log('render');
    return (
        (<div className="App">
        <Othello/>
      </div>)
    )
  }
}

export default App;
