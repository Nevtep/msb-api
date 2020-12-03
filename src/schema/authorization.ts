import store, { Op, UserModel } from '../datasources/models';
import ServiceAPI from '../datasources/Service';

const serviceAPI = new ServiceAPI({ store });

export const isAdmin = (user: UserModel) => {
    const now = Date.now();
    // const activeService = await serviceAPI.findOne({
    //     [Op.and]: [
    //         { endDate: { [Op.gt]: now }},
    //         { startDate: { [Op.lt]: now }},
    //         { name: 'ADMIN'},
    //         { UserId: user.id, }
    //     ]
    // })
    const activeService = user.subscriptions?.filter(subscription => (
        subscription.endDate > new Date() &&
        subscription.startDate < new Date() &&
        subscription.name === 'ADMIN'
    ));
    return !!activeService && activeService?.length > 0;
};

export const isVIP = (user: UserModel) => {
    const now = Date.now();
    // const activeService = await serviceAPI.findOne({
    //     [Op.and]: [
    //         { endDate: { [Op.gt]: now }},
    //         { startDate: { [Op.lt]: now }},
    //         { name: 'VIP'},
    //         { UserId: user.id, }
    //     ]
    // });
    const activeService = user.subscriptions?.filter(subscription => (
        subscription.endDate > new Date() &&
        subscription.startDate < new Date() &&
        subscription.name === 'VIP'
    ));
    return !!activeService && activeService?.length > 0;
};