const attributeExceptions = [`role`];
function appendText(el, text) {
  const textNode = document.createTextNode(text);
  el.appendChild(textNode);
}

function appendArray(el, children) {
  children.forEach((child) => {
    if (Array.isArray(child)) {
      appendArray(el, child);
    } else if (child instanceof window.Element) {
      el.appendChild(child);
    } else if (typeof child === `string`) {
      appendText(el, child);
    }
  });
}

function setStyles(el, styles) {
  if (!styles) {
    el.removeAttribute(`styles`);
    return;
  }
}

function makeElement(type, textOrPropsOrChild, ...otherChildren) {
  const el = document.createElement(type);

  if (Array.isArray(textOrPropsOrChild)) {
    appendArray(el, textOrPropsOrChild);
  } else if (typeof textOrPropsOrChild === `object`) {
    Object.keys(textOrPropsOrChild).forEach((propName) => {
      if (propName in el || attributeExceptions.includes(propName)) {
        const value = textOrPropsOrChild[propName];

        if (propName === `style`) {
          setStyles(el, value);
        } else if (value) {
          el[propName] = value;
        }
      } else {
        console.warn(`${propName} is not a valid property of a <${type}>`);
      }
    });
  }

  if (otherChildren) appendArray(el, otherChildren);

  return el;
}

const div = (...args) => makeElement(`div`, ...args);
const h1 = (...args) => makeElement(`h1`, ...args);
const p = (...args) => makeElement(`p`, ...args);
const ul = (...args) => makeElement(`ul`, ...args);
const li = (...args) => makeElement(`li`, ...args);
const a = (...args) => makeElement(`a`, ...args);
const button = (...args) => makeElement(`button`, ...args);

const returnedItem = document.getElementsByClassName("itemName");

const newArr = [];

const returnedItemArr = Array.from(returnedItem);

const rer = returnedItemArr.forEach((item) => {
  const innerStuff = item.innerHTML;
  const returnedFileName = innerStuff.split(";")[0];
  const returnedFileLink = innerStuff.split(";")[1];
  newArr.push({ name: returnedFileName, link: returnedFileLink });
});

Component = () => {
  return div(
    { id: "root" },
    div(
      { className: "container" },
      h1({ className: `headerTitle` }, "My Files"),
      p(
        { className: "headerSubtitle" },
        "Click on the filename to download it"
      ),
      div(
        { className: "ulContainer" },
        ul(
          { id: "fileListUl", className: "fileListUl" },
          newArr.map((content) =>
            li(
              {
                id: Math.random().toString(36).substring(7),
                className: "fileListLi",
              },
              a(
                {
                  id: Math.random().toString(36).substring(7),
                  className: "fileAnchorLink",
                  href: `/download/${content.link}`,
                },
                content.name
              )
            )
          )
        )
      )
    )
  );
};

const App = () => Component();
const renderer = document.getElementById("root");

document.body.insertBefore(App(), renderer);
