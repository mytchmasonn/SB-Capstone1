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
const a = (...args) => makeElement(`a`, ...args);
Component = () => {
  return div(
    { id: "root" },
    div(
      { className: "container" },
      div(
        { className: "home-hero" },
        h1({ id: "homeAnonTitle" }, "HTML to PDF"),
        p({ id: "homeAnonSubtitle" }, "Signup to use!"),
        a({ href: "/signup", className: "btn btn-primary" }, "Sign up")
      )
    )
  );
};

const App = () => Component();
const renderer = document.getElementById("root");

document.body.insertBefore(App(), renderer);
