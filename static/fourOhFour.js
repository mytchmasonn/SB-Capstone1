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
const h4 = (...args) => makeElement(`h4`, ...args);
const p = (...args) => makeElement(`p`, ...args);
const a = (...args) => makeElement(`a`, ...args);

Component = () => {
  return div(
    { id: "root" },
    div(
      { className: "container" },
      div(
        { className: "message-404" },
        h4(
          { className: "display-4" },
          `Oops! The page you requested doesn't exist.`
        ),
        p(
          { className: "m-3" },
          a({ href: "/", className: "styledLink" }, "Return to the homepage")
        )
      )
    )
  );
};

const App = () => Component();
const renderer = document.getElementById("root");

document.body.insertBefore(App(), renderer);
