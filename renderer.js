
const screenEl = document.getElementById("screen");
const historyEl = document.getElementById("history");
const buttons = document.querySelectorAll("button");

let expr = "";
let lastResult = null;

function setScreen(text) {
    screenEl.textContent = text;
}

function setHistory(history) {
    historyEl.textContent = history;
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
    const cleaned = input.replace(/[^\d+\-*/%.()]/g, "");
    return cleaned.replace(/%/g, "/100");
}

function canAddDot() {
    const chunk = expr.split(/[+\-*/]/).pop();
    return !chunk.includes(".");
}

function allClear() {
    expr = "";
    lastResult = null;
    setHistory("");
    setText(0);
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
        expr = expr.splice(0, -1) + op;
    } else {
        expr += op
    }

    setScreen(expr)
    lastResult = null;
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
        setScreen(formatDisplay(result));
        expr = String(result);
        lastResult = result;
    } catch {
        setHistory(expr);
        setScreen("Error");
        expr = ""
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
        if (isOperator(value)) return appendOperator(value);
        return appendDigits(value);
    }
});