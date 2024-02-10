import process from "node:process";
import { Server } from "./server.js";

const nameFolder = process.argv[2];
if (nameFolder === undefined) {
  throw new Error("please provide a path to the name folder");
}

const port = 3000;

const srv = new Server(port, nameFolder);

srv.run();
