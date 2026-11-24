/**
 * B9.7 isolated manual Cloudflare Worker entrypoint.
 * This file is NOT imported by the public site and must not be deployed
 * until a separately authorized private smoke test.
 */
import {connect} from "cloudflare:sockets";
import {handleProbeRequest} from "./_lib/smtp-probe-handler.ts";
import type {DiagnosticEnv} from "./_lib/smtp-probe-handler.ts";
export default {
  fetch(request:Request,env:DiagnosticEnv){
    return handleProbeRequest(request,env,connect);
  }
};
