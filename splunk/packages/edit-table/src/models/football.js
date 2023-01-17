import { EXAMPLE_ENUM } from './enum';

const Football = {
    Score: {
        type: 'number',
        props: {
            min: 0,
            max: 1000,
        },
    },
    Title: {
        type: 'enum', // just for testing, this should be 'string'
        options: EXAMPLE_ENUM,
        props: {},
    },
    Year: {
        type: 'number',
        props: {
            min: 1900,
            max: 2100,
        },
    },
};

export default Football;
