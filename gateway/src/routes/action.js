import express from "express";

const router = express.Router();

router.route("/scheduled-actions/:schedulerId/devices/:actiondeviceId")
    .post(this._nodeService.updateActionNode)
    .delete(this._nodeService.deleteActionNode);
