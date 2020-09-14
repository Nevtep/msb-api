import store, { Op, UserModel } from '../datasources/models';
import ServiceAPI from '../datasources/Service';

const serviceAPI = new ServiceAPI({ store });

export const isAdmin = (user: UserModel) => user.email === 'santiago.vottero@autocity.com.ar';

export const isVIP = async (user: UserModel) => {
    const now = Date.now();
    const activeService = await serviceAPI.findOne({
        [Op.and]: [
            { endDate: { [Op.gt]: now }},
            { startDate: { [Op.lt]: now }},
            { RoleId: 'VIP'},
            { UserId: user.id, }
        ]
    })
    console.log('activeService', activeService)
    return !!activeService;
};