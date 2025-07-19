import { sign } from 'jsonwebtoken';


export class JwtHelper {
    //Signs a jwt token for a user
    static async signToken(user: any) {
        const payload = {
            id: user._id,
        };
        return sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1hr'});
    }

    
}