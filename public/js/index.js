let eventsCalled = {}; //stores for each event whether it was called at least once

//functions that get called when events are activated
//if one of their dependency events wasnt called atleast once, they dont get called
//if one event leads to multiple functions getting called, the priority determains the order
//activateWhenDependenciesTurnTrue makes it so if all dependencies turn true and the function was never called, it gets called even if the event wasnt an activator
let eventFunctions = [
    {
        functionToCall: DisplayWord,
        activators: ["b.gameState", "b.users", "b.word", "b.languageDirection"],
        dependencies: ["b.gameState", "b.users", "b.word", "b.languageDirection"],
        dataFrom: "b.word",
        priority: 0
    },{
        functionToCall: DisplayWaitingForPlayers,
        activators: ["b.gameState"],
        dependencies: ["b.gameState"],
        priority: 0
    },{
        functionToCall: UpdateLanguageDirection,
        activators: ["b.languageDirection"],
        dependencies: ["b.languageDirection"],
        dataFrom: "b.languageDirection",
        priority: 10
    },{
        functionToCall: RenderBoard,
        activators: ["b.gameState", "b.canvas", "b.users", "b.canvas-ownership"],
        dependencies: ["b.gameState", "b.canvas", "b.users"],
        priority: 0
    },{
        functionToCall: UpdateRerollBlock,
        activators: ["b.gameState","b.rerollValue","b.users"],
        dependencies: ["b.gameState","b.rerollValue","b.users"],
        priority: 0
    },{
        functionToCall: UpdateRerollValue,
        activators: ["b.rerollValue"],
        dependencies: ["b.rerollValue"],
        dataFrom: 'b.rerollValue',
        priority: 10
    },{
        functionToCall: ShowRerollNotification,
        activators: ["b.reroll"],
        dependencies: ["b.reroll"],
        priority: 0
    },{
        functionToCall: UpdateGameState,
        activators: ["b.gameState"],
        dependencies: ["b.gameState"],
        dataFrom: 'b.gameState',
        priority: 10
    },{
        functionToCall: DisplayMessage,
        activators: ["b.message"],
        dependencies: ["b.message", "b.users"],
        dataFrom: 'b.message',
        priority: 0
    },{
        functionToCall: CreateCanvas,
        activators: ["b.canvas"],
        dependencies: ["b.canvas", "b.users"],
        dataFrom: 'b.canvas',
        priority: 5,
        activateWhenDependenciesTurnTrue: true 
    },{
        functionToCall: UpdateCanvasOwnership,
        activators: ["b.canvas-ownership"],
        dependencies: ["b.canvas-ownership", "b.canvas", "b.users"],
        dataFrom: 'b.canvas-ownership',
        priority: 5
    },{
        functionToCall: UpdateTime,
        activators: ["b.time"],
        dependencies: ["b.time"],
        dataFrom: 'b.time',
        priority: 0
    },{
        functionToCall: UpdateUsers,
        activators: ["b.users"],
        dependencies: ["b.users"],
        dataFrom: 'b.users',
        priority: 10
    },{
        functionToCall: RenderUserList,
        activators: ["b.users"],
        dependencies: ["b.users"],
        priority: 0
    },{
        functionToCall: UpdateMessagestSentTo,
        activators: ["b.users", "b.gameState"],
        dependencies: ["b.users", "b.gameState"],
        priority: 0
    },{
        functionToCall: UpdateSquares,
        activators: ["b.squares"],
        dependencies: ["b.users", "b.canvas"],
        dataFrom: "b.squares",
        priority: 0
    },{
        functionToCall: PlayDing,
        activators: ["b.guessed"],
        dependencies: ["b.gameState", "b.guessed"],
        priority: 0
    },
];


socket.onAny((eventName, data) => {
    ProcessEvent(eventName, data);
})


function ProcessEvent(eventName, data)
{

    eventsCalled[eventName] = true;
    console.log("# " + eventName);

    [...eventFunctions]
        .sort((a,b) => b.priority-a.priority) //sort by highest priority to lowest
        .forEach(eventFunction => {


            if(eventFunction.dataFrom == eventName) {
                eventFunction.data = data;
                console.log(">> data " + eventFunction.functionToCall.name)

            }

            if((eventFunction.activators.includes(eventName) || (eventFunction.activateWhenDependenciesTurnTrue && !eventFunction.called)) &&
                eventFunction.dependencies.every(dependency => eventsCalled[dependency])) {     
                    
                eventFunction.functionToCall(eventFunction.data);
                eventFunction.called = true;
                console.log(">> call " + eventFunction.functionToCall.name)

            }
    });
}



function IsDrawableGameState()
{
    return ((gameState == "waitingForPlayers") || (gameState == "inProgress"));
}