declare namespace Japan {
  namespace Tokyo {
    namespace Minato {
      const isInTokyo: true;
      const isInOsaka: false;
      const area: 20.37;
      namespace Roppongi {
        const Station: 'H04';
      }
    }
  }
  namespace Osaka {
    interface Umeda {
      isInTokyo: false;
      hasYodobashiCamera: true;
    }
  }
}
