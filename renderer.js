
const screenEl = document.getElementById("screen");
const historyEl = document.getElementById("history");
const buttons = document.querySelectorAll("button");

document.getElementById("minimize")?.addEventListener("click", () => {
    window.windowControls?.minimize?.();
})

document.getElementById("maximize")?.addEventListener("click", () => {
    window.windowControls?.maximise?.();
})

document.getElementById("close")?.addEventListener("click", () => {
    window.windowControls?.close?.();
})

let expr = "";
let lastResult = null;

function setScreen(text) {
    screenEl.textContent = text;
}

function setHistory(history) {
    historyEl.textContent = history;
}

function setText(value) {
    screenEl.textContent = value;
}

function isOperator(ch) {
    return ch === "+" || ch === "-" || ch === "/" || ch === "*";
}

function formatNumber(n) {
    if (!Number.isFinite(n)) return "Error";
    const s = String(n);
    if (s.length <= 12) return s;
    return n.toPrecision(10).replace(/\.?0+$/, "");
}

function sanitizeExpression(input) {
  return input
    // normalize display symbols → real operators
    .replace(/−/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")

    // remove anything else that is unsafe
    .replace(/[^\d+\-*/%.()]/g, "")

    // simple percent handling
    .replace(/%/g, "/100");
}

function canAddDot() {
    const chunk = expr.split(/[+\-*/]/).pop();
    return !chunk.includes(".");
}

function allClear() {
    expr = "";
    lastResult = null;
    setHistory("");
    setText("0");
}

function backSpace() {
    if (!expr) return;
    expr = expr.slice(0, -1);
    setScreen(expr || "0");
}

function appendDigits(d) {
    if (lastResult != null && expr === String(lastResult)) {
        expr = "";
        lastResult = null;
    }
    expr += d;
    setScreen(expr);
}

function appendDot() {
    if (!expr || isOperator(expr.slice(-1))) {
        expr += "0.";
        setScreen(expr);
        return;
    }
    if (!canAddDot()) return;
    expr += ".";
    setScreen(expr);
}

function appendOperator(op) {
    if (expr === "" && lastResult != null) {
        expr = String(lastResult);
    }
    if (expr === "") return;

    if (/[+\-*/]$/.test(expr)) {
        expr = expr.slice(0, -1) + op;
    } else {
        expr += op;
    }

    setScreen(expr);
    lastResult = null;
}

function appendPercentage(){
    if (!expr) return;

    const n = Number(expr);
    if (!Number.isFinite(n)) return;

    expr = String(n / 100);
    setScreen(expr);
}

function evaluate(){
    if (!expr) return;

    const sanitized = sanitizeExpression(expr);

    // Don't evaluate if it ends with an operator
    if (/[+\-*/.]$/.test(sanitized)) return;

    try {
        const result = Function(`"use strict"; return (${sanitized});`)();
        if (!Number.isFinite(result)) throw new Error("bad result");

        setHistory(`${expr} =`);
        setScreen(formatNumber(result));
        expr = String(result);
        lastResult = result;
    } catch (e) {
        console.log("EVALUATE FAILED", {expr, sanitized, error: e});
        setHistory(expr);
        setScreen("Error");
        expr = "";
        lastResult = null;
    }
}

document.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.dataset.action;
    const value = btn.dataset.value;

    if (action == "allclear") return allClear();
    if (action == "backspace") return backSpace();
    if (action == "equals") return evaluate();

    if (value) {
        if (value == ".") return appendDot();
        if (value == "percentage") return appendPercentage();
        if (isOperator(value)) return appendOperator(value);
        return appendDigits(value);
    }
});