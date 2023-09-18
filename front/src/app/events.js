import refs from "./refs";
import Socket from "./classes/Socket";
import Canvas from "./classes/Canvas";
import Bot from "./classes/Bot";
import { disabledStartButtons, showModal } from "./functions";
import { settingsTpl } from "./template";

const canvas = new Canvas('#canvas');
window.volume = localStorage.getItem('volume') ? localStorage.getItem('volume') == 'true' : true;

refs.startOnline.addEventListener("click", e => {
    disabledStartButtons();
    setTimeout(() => new Socket(canvas), 200);
});

refs.startBot.addEventListener("click", e => {
    disabledStartButtons();
    setTimeout(() => new Bot(canvas), 200);
});

refs.modalClose.addEventListener("click", e => {
    refs.modal.querySelector('#modal-header-title').innerHTML = '';
    refs.modal.querySelector('#modal-body').innerHTML = '';
    refs.modal.classList.remove('active');
});

refs.settings.addEventListener("click", e => {
    showModal('Settings', settingsTpl());
});

refs.modal.addEventListener("click", e => {
    if (!e.target.closest('.target-volume')) return;

    if (e.target.classList.contains('fa-volume-high')) {
        e.target.classList.remove('fa-volume-high');
        e.target.classList.add('fa-volume-xmark');
        window.volume = false;
        localStorage.setItem('volume', false);
    } else {
        e.target.classList.remove('fa-volume-xmark');
        e.target.classList.add('fa-volume-high');
        window.volume = true;
        localStorage.setItem('volume', true);
    }
})
