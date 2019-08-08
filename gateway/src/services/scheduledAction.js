
async _getScheduledActions(req, res, next) {
    try {
        this._validateSchedulerFilterParams(req);
        let scheduledActions = await this._scheduledActionModel.ScheduledAction.findScheduledActions(
            req.query
        );
        scheduledActions.forEach(scheduledAction => delete scheduledAction.__v);
        res.status(200).json(scheduledActions);
    } catch (err) {
        next(err);
    }
}

async _creteScheduledAction(req, res, next) {
    try {
        const scheduledActionObject = this._validateScheduledAction(req, next);
        const scheduledAction = await new this._scheduledActionModel.ScheduledAction(
            scheduledActionObject
        ).save();

        this._scheduledActionCheckerJob.stopJobs();
        this._scheduledActionCheckerJob._initJobs();

        res.status(200).json({ _id: scheduledAction._id });
    } catch (err) {
        next(err);
    }
}

async _updateScheduledAction(req, res, next) {
    try {
        const schedulerId = req.params.schedulerId;
        let oldScheduledAction = await this._checkIfScheduledActionExists(
            schedulerId
        );
        let newScheduledActionObject = this._validateScheduledAction(req, next);
        await oldScheduledAction.updateScheduledAction(newScheduledActionObject);

        this._scheduledActionCheckerJob.stopJobs();
        this._scheduledActionCheckerJob._initJobs();

        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
}

async _deleteScheduledAction(req, res, next) {
    try {
        const schedulerId = req.params.schedulerId;
        let scheduledAction = await this._checkIfScheduledActionExists(
            schedulerId
        );
        await this._actionNodeModel.ActionNode.find({
            reasonId: schedulerId
        }).remove();
        await scheduledAction.remove();

        this._scheduledActionCheckerJob.stopJobs();
        this._scheduledActionCheckerJob._initJobs();

        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
}
