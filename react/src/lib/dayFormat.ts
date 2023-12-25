import dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';


const now = dayjs() 
const taiwanYear = now.year() - 1911 
export const taiwanDate = now.locale('zh-tw').format(`${taiwanYear}年MM月DD日`) 