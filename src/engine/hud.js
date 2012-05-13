define(["dat/gui/GUI"], function(DatGUI){
  
  //var __bigMessage = document.getElementById("big-message-wrapper");

  //__bigMessage.classList.add("can-fade");

  var __coins = document.getElementById("coins");
  var __coinsContainer = document.getElementById("coinsDiv");

  var __datgui = new DatGUI();

  return {
    datgui: __datgui,

    showBigMessage: function(msg){
      // __bigMessage.firstChild.innerHTML = msg;
      // __bigMessage.style.visibility = "visible";
      // setTimeout(function(){
      //   __bigMessage.classList.add("fade-in");
      // }, 0);
    },
    hideBigMessage: function(){
      // __bigMessage.classList.remove("fade-in");
      // setTimeout(function(){
      //   __bigMessage.style.visibility = "hidden";
      // }, 1000);
    },

    setCoins: function(coins){
      __coins.innerHTML = coins;
    },

    showStatus: function(){
      __coinsContainer.classList.add("fade-in");
    }

  };

});