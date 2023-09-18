export function settingsTpl() {
    return `<ul class="settings">
        <li>
            Sounds: <i class="fa-solid ${(window.volume ? 'fa-volume-high' : 'fa-volume-xmark')} target-volume"></i>
        </li>
    </ul>`
}
