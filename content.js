// Copyright 2017 Hazuki Tachibana
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const FONT_URL = 'https://dl.dropboxusercontent.com/s/5me44aeb19mxm6e/juliamo.woff';

const ESPERANTO = [
  'エスペラント語',
  'Esperanto',
];

function insertStyle(content) {
  const style = document.createElement('style');
  style.appendChild(document.createTextNode(content));
  document.head.appendChild(style);
}

function replaceEsperantoToJuliamo(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (ESPERANTO.indexOf(node.textContent) >= 0) {
      node.textContent = 'Juliamo';
      node.parentElement.classList.add('juliamo');
    }
  }
}

class TextTranslateUIRewriter {
  static isEligible() {
    const parser = document.createElement('a');
    parser.href = location.href;
    return parser.hostname === 'translate.google.com' && parser.pathname === '/';
  }

  start() {
    this.insertStyle_();
    replaceEsperantoToJuliamo();
    this.listenLanguageChanges_();
    this.listenTextChanges_();
  }

  insertStyle_() {
    insertStyle(`
      @font-face {
        font-family: 'Juliamo';
        src: url('${FONT_URL}');
      }
      .juliamo,
      *[value=eo],
      body.juliamo-output #gt-res-content,
      body.juliamo-output .gt-is-tr,
      body.juliamo-input #source,
      body.juliamo-input .gt-is-sg {
        font-family: 'Juliamo' !important;
      }
    `);
  }

  listenLanguageChanges_() {
    const observer = new MutationObserver((records) => {
      this.onLanguageChanged_();
    });
    for (let elementId of ['gt-tl', 'gt-sl']) {
      const element = document.getElementById(elementId);
      observer.observe(element, {attributes: true});
    }
    this.onLanguageChanged_();
  }

  listenTextChanges_() {
    const observer = new MutationObserver((records) => {
      replaceEsperantoToJuliamo();
    });
    observer.observe(document.body, {characterData: true, childList: true, subtree: true});
  }

  onLanguageChanged_() {
    const outputLanguage = document.getElementById('gt-tl').value;
    const inputLanguage = document.getElementById('gt-sl').value;
    document.body.classList.toggle('juliamo-output', outputLanguage === 'eo');
    document.body.classList.toggle('juliamo-input', inputLanguage === 'eo');
  }
}

class WebTranslateUIRewriter {
  static isEligible() {
    const parser = document.createElement('a');
    parser.href = location.href;
    return parser.hostname === 'translate.google.com' && parser.pathname === '/translate';
  }

  start() {
    this.insertStyle_();
    replaceEsperantoToJuliamo(document.getElementById('gt-langs'));
    this.listenLanguageChanges_(document.getElementById('gt-tl'));
    this.listenLanguageChanges_(document.getElementById('gt-sl'));
  }

  insertStyle_() {
    insertStyle(`
      @font-face {
        font-family: 'Juliamo';
        src: url('${FONT_URL}');
      }
      .juliamo,
      *[value=eo] {
        font-family: 'Juliamo' !important;
      }
    `);
  }

  listenLanguageChanges_(selectElement) {
    selectElement.addEventListener('change', () => {
      this.onLanguageChanged_(selectElement);
    });
    this.onLanguageChanged_(selectElement);
  }

  onLanguageChanged_(selectElement) {
    selectElement.classList.toggle('juliamo', selectElement.value === 'eo');
  }
}

class WebTranslateResultRewriter {
  static isEligible() {
    const parser = document.createElement('a');
    parser.href = location.href;
    const lang = document.documentElement.lang;
    return parser.hostname === 'translate.googleusercontent.com' && lang.indexOf('eo-') == 0;
  }

  start() {
    this.insertStyle_();
  }

  insertStyle_() {
    insertStyle(`
      @font-face {
        font-family: 'Juliamo';
        src: url('${FONT_URL}');
      }
      * {
        font-family: 'Juliamo' !important;
      }
      #google-infowindow * {
        font-family: arial, sans-serif !important;
      }
    `);
  }
}

function main() {
  if (TextTranslateUIRewriter.isEligible()) {
    const rewriter = new TextTranslateUIRewriter();
    rewriter.start();
  } else if (WebTranslateUIRewriter.isEligible()) {
    const rewriter = new WebTranslateUIRewriter();
    rewriter.start();
  } else if (WebTranslateResultRewriter.isEligible()) {
    const rewriter = new WebTranslateResultRewriter();
    rewriter.start();
  }
}

main();
