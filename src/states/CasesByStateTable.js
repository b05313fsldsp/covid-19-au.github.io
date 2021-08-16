import uuid from "react-uuid";
import React, { useState, useEffect } from "react";
import stateData from "../data/state.json";
import testedCases from "../data/testedCases.json";
// import i18n bundle
import i18next from "../assets/translations/i18n";
import { A } from "hookrouter";

const CONFIRMED = 1;
const DEATH = 2;
const CURED = 3;
const TESTED = 4;
const ACTIVE = 5;
const NONEWCASES = 8;
const REASSIGNED = 9;
const Vaccine = 10;


function ReassignedCaseDisclaimer({ reassignedData }) {
  let displayStates = {};
  for (let state in reassignedData) {
    if (reassignedData[state][1] > 0) {
      displayStates[state] = []
      displayStates[state].push(reassignedData[state][0])
      displayStates[state].push(reassignedData[state][1])
    }
  }

  const display = [];
  for (let state in displayStates) {
    display.push(
      <span className="due" style={{ fontSize: "80%", padding: 0 }}>
        *{state} has {displayStates[state][0]} new cases, {displayStates[state][1]} previous cases have been reclassified
      </span>
    );
  }

  return (
    <div>
      {
        display.map(item => (
          <div>{item}</div>
        )
        )
      }
    </div>
  );
}

export default function CasesByStateTable({ area, onChange, data }) {
  let totalRecovered = 0;
  for (let i = 0; i < data.length; i++) {
    totalRecovered += parseInt(data[i][3]);
  }
  let lastTotal =
    stateData[Object.keys(stateData)[Object.keys(stateData).length - 1]];

  const getAriaLabel = (state, confirmed, death, recovered, tested) => {
    return `In ${state
      .split("")
      .join(
        " "
      )}, there were ${confirmed} confirmed cases. Out of them, ${death} unfortunately resulted in death.

    ${recovered} recovered and ${tested} were tested`;
  };
  const reassignedCases = {}
  let i = 0
  while (i < data.length-2) {
    let currentState = data[i][0]
    reassignedCases[data[i][0]] = []
    currentState==="GP"||currentState==="Cth"?reassignedCases[data[i][0]].push(data[i][CONFIRMED]):
    reassignedCases[data[i][0]].push(data[i][CONFIRMED] - lastTotal[currentState][0])
    reassignedCases[data[i][0]].push(parseInt(data[i][REASSIGNED]))
    reassignedCases[currentState][0] = reassignedCases[currentState][0] + reassignedCases[currentState][1]
    i = i + 1
  }

  const renderArea = () => {
    let latest =
      testedCases[
      Object.keys(testedCases)[Object.keys(testedCases).length - 1]
      ];
    let stateData = data
    return stateData.slice(0,8).map((x) => (
      <div
        role={"button"}
        aria-label={getAriaLabel(...x)}
        aria-describedby={getAriaLabel(...x)}
        className="province"
        key={uuid()}
      >
        {/*<div className={`area ${x.name ? 'active' : ''}`}>*/}
        {/*{ x.name || x.cityName }*/}
        {/*</div>*/}
        {/*<div className="confirmed">{ x.confirmedCount }</div>*/}
        {/*<div className="death">{ x.deadCount }</div>*/}
        {/*<div className="cured">{ x.curedCount }</div>*/}
        <div className={"area"}>
          {x[0]==="Cth"||x[0]==="GP"?(
              <strong>
                {x[0]}{" "}
              </strong>
          ):(
          <A
            href={`/state/${x[0].toLowerCase()}`}
            onClick={() => {
              window.scrollTo(0, 0);
            }}
          >
            <strong>
              <u>{i18next.t("homePage:state." + x[0])}</u>{" "}
              <svg
                className="bi bi-caret-right-fill"
                width="1em"
                height="1em"
                viewBox="0 0 16 16"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 011.659-.753l5.48 4.796a1 1 0 010 1.506z" />
              </svg>
            </strong>
          </A>)}
        </div>
        <div className="confirmed">
          {x[0]==="Cth"||x[0]==="GP"? (" "):(reassignedCases[x[0]][1] > 0 ? <strong>{numberWithCommas(x[CONFIRMED])}*</strong> : <strong>{numberWithCommas(x[CONFIRMED])}</strong>)}&nbsp;
          {x[0]==="Cth"||x[0]==="GP"? null :x[NONEWCASES] === "true" ? (
            <div className="dailyIncrease">(+0)</div>
          ) : (
              <div className="dailyIncrease">
                {x[CONFIRMED] - lastTotal[x[0]][0] > 0
                  ? `(+${x[1] - lastTotal[x[0]][0]})`
                  : x[CONFIRMED] - lastTotal[x[0]][0] < 0
                    ? `(-${lastTotal[x[0]][0] - x[1]})`
                    : null}
              </div>
            )}
        </div>
        <div className="death">
          {x[0]==="Cth"||x[0]==="GP"? null :x[0] === "NSW" || x[0] === "QLD" ? (
            <strong> {numberWithCommas(x[DEATH])}&#x5e; </strong>
          ) : (
              <strong> {numberWithCommas(x[DEATH])} </strong>
            )}
          &nbsp;
          <div className="dailyIncrease">
            {x[0]==="Cth"||x[0]==="GP"? null :x[DEATH] - lastTotal[x[0]][1] > 0
              ? ` (+${x[2] - lastTotal[x[0]][1]})`
              : null}
          </div>
        </div>
        <div className="activeCase">
          {x[0]==="Cth"||x[0]==="GP"? null :<strong> {numberWithCommas(x[ACTIVE])} </strong>}&nbsp;
          <div className="dailyIncrease">
            {x[0]==="Cth"||x[0]==="GP"? null :x[ACTIVE] - lastTotal[x[0]][4] > 0
              ? `(+${x[ACTIVE] - lastTotal[x[0]][4]})`
              : x[ACTIVE] - lastTotal[x[0]][4] < 0
                ? `(-${lastTotal[x[0]][4] - x[ACTIVE]})`
                : null}
          </div>
        </div>
        <div className="cured">
          {numberWithCommasLarge(numberWithCommas(x[Vaccine]))}
          <div className="dailyIncrease">
            {x[0]==="Cth"||x[0]==="GP"? null :x[Vaccine] - lastTotal[x[0]][7] > 0
                ? `(+${numberWithCommasLarge(x[10] - lastTotal[x[0]][7])})`
                : null}
          </div>
        </div>
        <div className="tested">{
          x[0]==="Cth"||x[0]==="GP"? null :numberWithCommasLarge(x[TESTED])

        }</div>
      </div>
    ));
  };

  const Total = ({ data }) => {
    const sumRow = (index, data) =>
      data.reduce((total, row) => {
        const val = +row[index] || 0;
        return total + val;
      }, 0);

    return (
      <div className="province table-footer">
        <div className="area">{i18next.t("homePage:status.total")}</div>
        <div className="confirmed">
          {numberWithCommas(sumRow(CONFIRMED, data))}
        </div>
        <div className="death">{numberWithCommas(sumRow(DEATH, data))}</div>
        <div className="activeCase">
          {numberWithCommas(sumRow(ACTIVE, data))}
        </div>
        <div className="cured">{`${numberWithCommas(sumRow(Vaccine, data))}`}</div>
        <div className="tested">
          {numberWithCommasLarge(sumRow(TESTED, data))}
        </div>
      </div>
    );
  };

  return (
    <div role={"table"}>
      <div className="province header">
        <div className="area header statetitle">
          {i18next.t("homePage:status.state")}
        </div>
        <div className="confirmed header confirmedtitle">
          {i18next.t("homePage:status.confirm")}
        </div>
        <div className="death header deathtitle">
          {i18next.t("homePage:status.Deaths")}
        </div>
        <div className="activeCase header activetitle">
          {i18next.t("homePage:status.active")}
        </div>
          <div className="cured header recoveredtitle">
              {i18next.t("homePage:status.vaccination")}
          </div>
        <div className="tested header testedtitle">
          {i18next.t("homePage:status.Tested")}
        </div>
      </div>
      {renderArea()}
      <Total data={data} />

      <ReassignedCaseDisclaimer reassignedData={reassignedCases} />
      {/*  <span className="due" style={{ fontSize: "80%", padding: 0 }}>*/}
      {/*  <sup>*</sup> {`Total Vaccine doses also include Commonwealth Government: ${numberWithCommas(data[8][Vaccine])} and GP Clinics: ${numberWithCommas(data[9][Vaccine])}. `}*/}
      {/*</span>*/}
      {/*  <br />*/}
      <span className="due" style={{ fontSize: "80%", padding: 0 }}>
        <sup>&#x5e;</sup> NSW active cases are locally acquired COVID-19 cases with onset in the last four weeks.
      </span>
      <br />
      <span className="due" style={{ fontSize: "80%", padding: 0 }}>
        <sup>&#x5e;</sup> Two Queensland residents that passed away in NSW are
        included in the Queensland figure.
      </span>
      <br />
      <span className="due" style={{ padding: 0 }}>
          See also the <A href="/state" className="citationLink">states page</A> for more detailed statistics.
      </span>
    </div>
  );
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function numberWithCommasLarge(x) {
  let numStr = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  let commaCount = (numStr.match(/,/g) || []).length;
  if(commaCount === 2 ){
    return numStr.substring(0, 4).replace(",", ".") + "M";
  } else if(commaCount === 1) {
    return numStr.split(",")[0] + "K";
  } else {
    return numStr
  }
}
