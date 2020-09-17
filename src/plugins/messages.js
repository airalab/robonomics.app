import services from "../services";

const messages = Object.values(services).filter((item) => item.messages);
const en = messages.reduce(function (result, item) {
  return { ...result, [item.messages.id]: item.messages.en };
}, {});
const ru = messages.reduce(function (result, item) {
  return { ...result, [item.messages.id]: item.messages.ru };
}, {});

export default {
  en: {
    header: "Aira → XRT alembic",
    action: "To the action!",
    tip_text:
      "It is important to turn your Aira tokens into Aira ID as early as possible, but you do not have to turn all your Aira ID tokens into XRT. If you want to become a provider or use the network, you can use the Aira ID → XRT alembic at any time to transfer any amount of Aira ID an unlimited number of times.",
    convert: {
      convert: "Convert to",
      unapprove: "Unapprove",
      approve: "Approve"
    },
    menu: {
      home: "Home",
      telemetry: "Telemetry",
      services: "Services",
      lighthouses: "Lighthouses",
      parachain: "Parachain",
      uniswap: "Uniswap",
      alembic: "AIRA → XRT",
      riot: "Riot chat",
      rws: "RWS",
      votes: "XRT → DAO VOTES"
    },
    sidebar: { connect: "Connect account" },

    waiting: "Waiting for IPFS data",
    no_data: "No data available",
    lighthouse_title: "Robonomics Telemetry",
    lighthouse_h: "lighthouse",
    provider: "provider",
    peers: "peers",
    date: "date",
    network: "network",
    statistics_header: "Statistics of Robonomics network",
    сonnected: "Connected",
    no_сonnected: "No connection",

    robotics_ethereum_control: "Robots under Ethereum control",
    total_contracts: "Total launched by Robonomics gen 5",
    fin_contarcts: "Amount of finalized contract liabilities",
    total: "total",
    day: "last 24 hours",
    week: "last week",
    month: "last month",
    expand: "Expand",
    minimize: "Minimize",
    amount_gas: "Amount of recycling gas",
    total_gas: "Full amount of utilized gas",
    fin_gas: "Profit amount of utilized gas",
    robo_token: "Average provider reward",
    token_addr: "Token address",
    token_stat: "Token statistics",
    token_total: "Total amount of XRT in circulation",
    reward_tx: "Average provider reward ~",
    services: {
      title: "Robonomics services"
    },
    approve: {
      allowance: "Approved",
      approve: "Approve",
      cost: "Cost",
      balance: "Balance"
    },
    sensors: {
      title: "Sensor networks",
      requested: "Requested",
      isRequest: "Request current values"
    },
    lighthouse: {
      title: "Lighthouses",
      details: {
        title: "Lighthouse details",
        contract: "Lighthouse contract address",
        status: "Lighthouse status",
        sleeping: "Sleeping",
        active: "Active",
        balance: "Balance",
        stake: "Minimal stake per quote"
      },
      market: {
        error: "Check if data correct, please.",
        broadcast: "Broadcast signal to the network",
        messages: "Messages from the Robonomics.network"
      },
      providers: {
        title: "Providers",
        address: "Address",
        quota: "Quota",
        balance: "Balance",
        status: "Status",
        sleeping: "Sleeping",
        last: "Provider sent tx {blocks} blocks ago",
        more: "Provider sent tx more than {blocks} blocks ago"
      },
      trade: {
        title: "Send message to the Robonomics.network",
        correct: "Check if data correct, please.",
        more: "More options"
      },
      withdraw: {
        from: "Withdraw from lighthouse",
        text: "Withdraw"
      },
      approve: {
        value: "Available for work at the lighthouse",
        count: "Available for work",
        quotes: "Approve quotes",
        approved: "Approved",
        refill: "Refill"
      },
      select: {
        new: {
          new: "New lighthouse",
          desc: "create new lighthouse",
          name: "Name of the lighthouse",
          stake: "Minimal stake to get one quota (XRT)",
          blocks: "Silence timeout for provider in blocks",
          create: "Create and connect"
        },
        error: {
          stake: "Error: Minimal stake value 1",
          timeout: "Error: Minimal timeout value 1",
          name: "Error: Require name lighthouse",
          exist: "Error: Exist name lighthouse"
        },
        connect: "Connect",
        cancel: "Cancel",
        choose: "Choose lighthouse"
      }
    },
    steps: {
      contract:
        "A smart contract has been created, we are waiting for the robot to execute the service.",
      view_contract: "View contract.",
      executed: "Smart contract is executed!"
    },
    ...en
  },
  ru: {
    header: "Перегонный куб Aira токенов в XRT",
    action: "К действию!",
    tip_text:
      "Важно превратить свои Aira токены в Aira ID как можно раньше, но не обязательно превращать все свои токены Aira ID в XRT. Если вы хотите стать провайдером или пользоваться сетью, вы можете пользоваться перегонным кубом Aira ID → XRT в любое время для перегонки любого количества Aira ID неограниченное количество раз.",
    convert: {
      convert: "Конвертировать в",
      unapprove: "Отозвать",
      approve: "Аппрув"
    },
    menu: {
      home: "Главная",
      telemetry: "Телеметрия",
      services: "Сервисы",
      lighthouses: "Маяки",
      parachain: "Parachain",
      uniswap: "Uniswap",
      alembic: "AIRA → XRT",
      riot: "Riot chat",
      rws: "RWS",
      votes: "XRT → DAO VOTES"
    },
    sidebar: { connect: "Подключить аккаунт" },

    waiting: "Ожидание данных IPFS",
    no_data: "Данные отсутствуют",
    lighthouse_title: "Robonomics Телеметрия",
    lighthouse_h: "маяк",
    provider: "провайдер",
    peers: "пиры",
    date: "дата",
    network: "сеть",
    statistics_header: "Статистика сети робономики",
    сonnected: "Работает",
    no_сonnected: "Не работает",

    robotics_ethereum_control: "Роботов под управлением эфира",
    total_contracts: "Всего обязательств в Robonomics gen 5",
    fin_contarcts: "Кол-во финализированных обязательств",
    total: "всего",
    day: "за последнии 24 часа",
    week: "за последнюю неделю",
    month: "за последний месяц",
    expand: "Подробнее",
    minimize: "Скрыть",
    amount_gas: "Количество утилизированного газа",
    total_gas: "Всего утилизированного газа",
    fin_gas: "Кол-во полезного утилизированного газа",
    robo_token: "Средняя награда провайдера",
    token_addr: "Адрес токена",
    token_stat: "Статистика токена",
    token_total: "Общее количество XRT в обращении",
    reward_tx: "Средняя награда провайдера ~",
    services: {
      title: "Сервисы робономики"
    },
    approve: {
      allowance: "Одобрено",
      approve: "Одобрить",
      cost: "Стоимость",
      balance: "Ваш баланс"
    },
    sensors: {
      title: "Сенсорные сети",
      requested: "Запрошено",
      isRequest: "Запросить текущие значения"
    },
    lighthouse: {
      title: "Маяки",
      details: {
        title: "О маяке",
        contract: "Адрес контракта маяка",
        status: "Статус маяка",
        sleeping: "Спит",
        active: "Активен",
        balance: "Баланс",
        stake: "Минимальная ставка за квоту"
      },
      market: {
        error: "Проверьте правильность данных, пожалуйста.",
        broadcast: "Трансляция сигнала в сеть",
        messages: "Сообщения из сети Robonomics.network"
      },
      providers: {
        title: "Провайдеры",
        address: "Адрес",
        quota: "Квота",
        balance: "Баланс",
        status: "Статус",
        sleeping: "Спит",
        last: "Провайдер отправил tx {blocks} блоков назад",
        more: "Провайдер отправил tx более чем {blocks} блоков назад"
      },
      trade: {
        title: "Отправить сообщение в сеть Robonomics.network",
        correct: "Проверьте правильность данных, пожалуйста.",
        more: "Больше опций"
      },
      withdraw: {
        from: "Выйти из маяка",
        text: "Выйти"
      },
      approve: {
        value: "Доступно для работы на маяке",
        count: "Доступно для работы",
        quotes: "Одобрить квоты",
        approved: "Одобренный",
        refill: "Вывести"
      },
      select: {
        new: {
          new: "Новый маяк",
          desc: "создать новый маяк",
          name: "Наименование маяка",
          stake: "Минимальная ставка для получения одной квоты (XRT)",
          blocks: "Тайм-аут для провайдера в блоках",
          create: "Создать и подключить"
        },
        error: {
          stake: "Ошибка: минимальное значение ставки 1",
          timeout: "Ошибка: минимальное значение тайм-аута 1",
          name: "Ошибка: требуется название маяка",
          exist: "Ошибка: существует имя маяка"
        },
        connect: "Подключиться",
        cancel: "Отмена",
        choose: "Выберите маяк"
      }
    },
    steps: {
      contract: "Умный контракт создан, мы ждем, что робот выполнит услугу.",
      view_contract: "Посмотреть контракт.",
      executed: "Умный контракт выполнен!"
    },
    ...ru
  }
};
