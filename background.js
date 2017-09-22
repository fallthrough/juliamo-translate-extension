function isTranslateUrl(url) {
  const parser = document.createElement('a');
  parser.href = url;
  return parser.hostname === 'translate.google.com';
}

function onClicked(tab) {
  const currentUrl = tab.url;
  if (isTranslateUrl(currentUrl)) {
    return;
  }

  const translateUrl = 'https://translate.google.com/translate?sl=auto&tl=eo&u=' + currentUrl;
  chrome.tabs.create({url: translateUrl});
}

chrome.browserAction.onClicked.addListener(onClicked);
