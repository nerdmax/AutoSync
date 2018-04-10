import { remote } from 'electron';

console.log('aaaaaadfsdfd');

// console.log(electron.remote.app);
remote.app.setAppUserModelId('org.develar.ElectronReact');
const myNotification = new Notification('Title', {
  body: 'Lorem Ipsum Dolor Sit Amet'
});
