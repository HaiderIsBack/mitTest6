    
ScrollReveal({ reset: true });


var slideUp = {
    distance: '150%',
    origin: 'bottom',
    opacity: 0
};

ScrollReveal().reveal('.slide-up', slideUp);

var isOpened = false;
var sidebar = document.getElementById("sideBar");
function sideBar(){
    if(isOpened){
        sidebar.classList.remove("active");
        isOpened = false;
    }else{
        sidebar.classList.add("active");
        isOpened = true;
    }
}