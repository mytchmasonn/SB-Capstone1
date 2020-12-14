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
const span = (...args) => makeElement(`span`, ...args);
const input = (...args) => makeElement(`input`, ...args);
const form = (...args) => makeElement(`form`, ...args);
const button = (...args) => makeElement(`button`, ...args);

Component = () => {
  const handleClick = (e) => {
    e.preventDefault();
    document.getElementById("spinnerDiv").classList.add("lds-ring");
    document.getElementById("submitbtn").classList.add("hide");
    document.forms["form1"].submit();
  };

  return div(
    { id: "root" },
    div(
      { className: "container" },
      h1({ className: `headerTitle` }, "Convert!"),
      form(
        { method: "POST", action: "/upload", id: "form1" },
        div(
          { className: "input-group input-group-sm mb-3" },
          div(
            { className: "input-group-prepend" },
            span(
              { className: "input-group-text", id: "inputGroup-sizing-sm" },
              "URL to convert"
            )
          ),
          input({
            id: "url",
            name: "url",
            type: "text",
            className: "form-control",
            placeholder: "https://example.com",
          })
        ),
        div(
          { className: "input-group input-group-sm mb-3" },
          div(
            { className: "input-group-prepend" },
            span(
              { className: "input-group-text", id: "inputGroup-sizing-sm" },
              "Alias/Nickname for file"
            )
          ),
          input({
            id: "name",
            name: "name",
            type: "text",
            className: "form-control",
            placeholder: "https://example.com",
            maxLength: "20",
          }),
          div(
            { className: "input-group-append" },
            span({ className: "input-group-text" }, "Max Length: 20")
          )
        ),
        button(
          {
            type: "submit",
            className: "btn btn-primary",
            id: "submitbtn",
            onclick: handleClick,
          },
          "Submit"
        ),
        div(
          { className: "", id: "spinnerDiv" },
          div({ id: "d1" }, ""),
          div({ id: "d2" }, ""),
          div({ id: "d3" }, ""),
          div({ id: "d4" }, "")
        )
      )
    )
  );
};

const App = () => Component();
const renderer = document.getElementById("root");

document.body.insertBefore(App(), renderer);
