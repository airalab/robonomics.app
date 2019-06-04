<template>
  <section>
    <h1>{{ $t('header') }}</h1>
    <div class="section-border">
      <p>
        <b>Держатель токенов Aira!</b>
      </p>
      <p>
        С твоей помощью мы проделали путь от прототипа программного обеспечения
        <a
          href="http://aira.life"
          target="_blank"
        >Aira</a> до
        <a href="http://robonomics.network" target="_blank">платформы Робономика</a>. Два года работы, более 50 релизов в
        <a
          href="https://github.com/airalab"
          target="_blank"
        >6 репозиториях на GitHub</a>, тысячи коммитов целой группы разработчиков. Твоя поддержка привела к появлению новой технологии, которая в дальнейшем призвана подчинить роботов децентрализованному компьютеру Ethereum. Ты помог этому. Спасибо!
      </p>
      <p>Важно понимать, что это не конец пути, а только самое начало. Мы создали новую технологию, теперь ее нужно растить и обучать сообщество пользоваться Робономикой.</p>
      <p>Токен платформы Робономика мы назвали XRT (Robonomics token). У тебя есть два варианта действий – пройти Civic ID и ожидать запуска Голландского аукциона или в 2 шага получить XRT уже сегодня.</p>
      <div id="intro" style="display:none">
        <p>
          <b>В чем разница этих вариантов для держателя Aira токенов:</b>
        </p>
        <table class="table-striped table-responsive">
          <thead>
            <tr>
              <th>Aira → Aira ID</th>
              <th>Aira → Aira ID → XRT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                data-th="Aira → Aira ID"
              >Всегда есть возможность превратить Aira ID в XRT без участия разработчиков, отправив транзакцию к перегонному кубу Aira ID → XRT</td>
              <td data-th="Aira → Aira ID → XRT">Обратно перегнать токены XRT в Aira ID не получится</td>
            </tr>
            <tr>
              <td
                data-th="Aira → Aira ID"
              >По результату Голландского аукциона 1 Aira ID может превратиться в N XRT, но не менее 1:1</td>
              <td
                data-th="Aira → Aira ID → XRT"
              >Если вы сделали оба шага и получили XRT, рассчитывать на приумножение количества XRT не получится</td>
            </tr>
            <tr>
              <td
                data-th="Aira → Aira ID"
              >Aira ID нельзя использовать, чтобы стать провайдером Робономики</td>
              <td
                data-th="Aira → Aira ID → XRT"
              >XRT может использоваться для обеспечения квоты на маяке Робономики</td>
            </tr>
            <tr>
              <td
                data-th="Aira → Aira ID"
              >Aira ID нельзя использовать, чтобы оплатить комиссию провайдерам Робономики</td>
              <td
                data-th="Aira → Aira ID → XRT"
              >С помощью XRT можно оплачивать транзакции в сети Робономика - ETH не потребуется</td>
            </tr>
            <tr>
              <td
                data-th="Aira → Aira ID"
              >Aira ID не планируется использовать при голосовании ДАО Робономики</td>
              <td
                data-th="Aira → Aira ID → XRT"
              >XRT можно использовать для создания предложений в ДАО Робономики о запуске Голландского аукциона, смене команды управляющих ENS записью Robonomics.eth</td>
            </tr>
            <tr>
              <td
                data-th="Aira → Aira ID"
              >Токен Aira и Aira ID не будут предлагаться разработчиками на дексы</td>
              <td
                data-th="Aira → Aira ID → XRT"
              >XRT будет предлагаться разработчиками и сообществом для добавления на биржи</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <a
      class="btn-violet container-full btn-simple"
      href="#"
      onclick="show(this, '#intro', '&amp;uarr; Свернуть письмо разработчиков &amp;uarr;', '&amp;darr; Развернуть письмо разработчиков &amp;darr;');return false;"
    >&darr; Развернуть письмо разработчиков &darr;</a>
  </section>
</template>

<script>
export default {};
</script>
