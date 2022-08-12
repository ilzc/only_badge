import pm2 from "pm2";

import inquirer from "inquirer";

import util from "util";

import jetpack from "fs-jetpack";

import dotenv from "dotenv";

import { exec as exe, spawn } from "child_process";

import ora from "ora";

import chalk from "chalk";

const pjson = jetpack.read("package.json", "json");

const spinner = ora();
spinner.spinner = "dots3";
spinner.color = "green";


function envErr() {
  throw new Error(
    `Unknown or missing CHAIN_ENV environment variable.
         Please provide one of the following: "emulator", "testnet"`
  );
}




function requireEnv(chainEnv) {
  switch (chainEnv) {
    case "emulator":
      return ".env.emulator";
    case "testnet":
      if (!jetpack.exists(".env.testnet")) {
        throw new Error(
          "Testnet deployment config not created. See README.md for instructions."
        );
      }
      return ".env.testnet";
    default:
      envErr();
  }
}

function runProcess(config, cb = () => {}) {
  return new Promise((resolve, reject) => {
    pm2.start(config, function (err, result) {
      if (err) {
        console.log(err);
        reject(err);
      }
      resolve(result);
    });
  });
}











  // ------------------------------------------------------------
  // ------------- EMULATOR ENVIRONMENT STARTUP -----------------


  // ------------------------------------------------------------
  // ------------- TESTNET ENVIRONMENT STARTUP ------------------


  dotenv.config({
    path: requireEnv(process.env.CHAIN_ENV)
  });

  spinner.start(process.env.CHAIN_ENV);
  spinner.start("Starting storefront web app");

  console.log("\n");
      const ps = spawn("npx", ["pm2", "logs", "--no-daemon"], {
        shell: true,
        stdio: "inherit"
      });
      ps.stdout?.on("data", (data) => {
        console.log(data.toString().trim());
      });
      process.on("SIGINT", () => {
        process.exit(0);
      }); // CTRL+C

  await runProcess({
    name: `api`,
    cwd: "./api",
    script: "npm",
    args: "run dev",
    watch: false,
    wait_ready: true,
    autorestart: false
  });

  spinner.succeed(chalk.greenBright("Front-end built sucessfully"));

  // ------------------------------------------------------------
  // --------------------- DONE -------------------------------


