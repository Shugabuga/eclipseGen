function eclipseGenCore() {
  var app = this;
  var editor = ace.edit("editor");
  var categoryHandler;
//  editor.getReadOnly();
  editor.getSession().setUseWorker(false);
  editor.getSession().setUseWrapMode(true);
  editor.setTheme("ace/theme/xcode");
  editor.getSession().setMode("ace/mode/json");
  editor.setReadOnly(true);

  app.ls = localStorage;

  app.log = function(message) {
      console.log('%c[Eclipse] %c' + message, "color:#ff3545", "color: gray");
  }

  app.init = function() {
    if(app.ls.getItem("eclipse") !== null) {
      app.log("Repo found in storage, loading...");
      app.loadEditor();
    } else {
      app.log("No repo found! Assumed as a first run, preparing...");
      app.firstLaunch();
    }
  }

  app.firstLaunch = function() {
    app.log("Creating the basic structure...");
    var arr = {
          "reponame": "Repo Name",
          "repologo": "https://example.com/icon.png",
          "repoauthor": "Repo Author",
          "repodesc": "This is an example Eclipse repo. It is pretty cool.",
          "categories": [{
            "categoryname": "Category Name",
            "games": [{
              "name": "Game Name",
              "link": "https://example.com/game.gba",
              "boxart": "Game Boxart",
              "system": "GBA"
            }]
          }]
    };
    console.log(arr);
    app.log("Saving basic structure to repo...");
    app.ls.eclipse = JSON.stringify(arr, null, 2);
    app.log("Saved! Welcoming user...");
    app.loadEditor();
    alert("Welcome to the Eclipse Repo Generator!");



  }

  app.loadEditor = function() {
    app.loadJSONViewer();


    app.loadGenerator();
  }

  app.loadJSONViewer = function() {
    var json = app.ls.eclipse;
    editor.setValue(json, 1);
  }

  app.loadGenerator = function(){
    var json = app.ls.eclipse;
    var data = JSON.parse(json);
    $("[edit-basic='reponame']").val(data.reponame);
    $("[edit-basic='repologo']").val(data.repologo);
    $("[edit-basic='repoauthor']").val(data.repoauthor);
    $("[edit-basic='repodesc']").val(data.repodesc);
    app.loadCategories();
  }

  app.generateString = function(string = 10) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < string; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  app.loadCategories = function() {
    var currentRepo = JSON.parse(app.ls.eclipse);
    console.log(currentRepo);
    //var html = "";
    $(".categories").html("");
    $.each(currentRepo.categories, function(key, value){
      var html = '<div class="category" id="'+app.generateString()+'">'+
                '<div class="name">'+
                value.categoryname +
                '</div>' +
              '<div class="games">'+
              '<div class="input-group">'+
              '<div class="input">'+
              '<label>Edit Name</label><input type="text" value="'+value.categoryname+'" edit-category="'+btoa(key)+'" /><br><br><div class="button" onclick="eclipseGen.addGame(\''+btoa(key)+'\')">Add Game</div><div class="button" onclick="eclipseGen.deleteCategory(\''+btoa(key)+'\')">Delete Repo</div>'+
              '</div>';


              $.each(value.games, function(id, game){
                //html += JSON.stringify(game);
                html +='<div class="input">'+
                    '<label>Game Name</label><input type="text" value="'+game.name+'" edit-game="'+btoa(JSON.stringify({"category": key, "game": id, "selector": "name"}))+'" /><br><br>'+
                    '<label>Game Link</label><input type="text" value="'+game.link+'" edit-game="'+btoa(JSON.stringify({"category": key, "game": id, "selector": "link"}))+'" /><br><br>'+
                    '<label>Game Boxart</label><input type="text" value="'+game.boxart+'" edit-game="'+btoa(JSON.stringify({"category": key, "game": id, "selector": "boxart"}))+'" /><br><br>'+
                    '<label>Game System</label>'+
                    '<select edit-game="'+btoa(JSON.stringify({"category": key, "game": id, "selector": "system"}))+'">';


                    if(game.system == "NES") {
                      html += '<option value="NES" selected>Nintendo Entertainment System</option>'+
                      '<option value="GB">Game Boy</option>'+
                      '<option value="GBC">Game Boy Color</option>'+
                      '<option value="GBA">Game Boy Advance</option>';
                    } else if(game.system == "GB") {
                      html += '<option value="NES">Nintendo Entertainment System</option>'+
                      '<option value="GB" selected>Game Boy</option>'+
                      '<option value="GBC">Game Boy Color</option>'+
                      '<option value="GBA">Game Boy Advance</option>';
                    } else if(game.system == "GBC") {
                      html += '<option value="NES">Nintendo Entertainment System</option>'+
                      '<option value="GB">Game Boy</option>'+
                      '<option value="GBC" selected>Game Boy Color</option>'+
                      '<option value="GBA">Game Boy Advance</option>';
                    } else if(game.system == "GBA") {
                      html += '<option value="NES">Nintendo Entertainment System</option>'+
                      '<option value="GB">Game Boy</option>'+
                      '<option value="GBC">Game Boy Color</option>'+
                      '<option value="GBA" selected>Game Boy Advance</option>';
                    }


                    html += '</select>'+
                    '<br><br><div class="button" onclick="eclipseGen.deleteGame(\''+btoa(key)+'\', \''+btoa(id)+'\')">Delete Game</div>'+
                  '</div>';

              });

              html += '</div>'+
              '</div>'+
            '</div>';

          $(".categories").append(html);
    });


    $("[edit-game]").unbind();
    $("[edit-category]").unbind();
    $("[edit-category]").on("input", function(){
      var currentRepo = JSON.parse(app.ls.eclipse);
      var categoryID = atob($(this).attr("edit-category"));
      var newValue = $(this).val();
     currentRepo.categories[categoryID].categoryname = newValue;
    //  console.log(currentRepo.categories[categoryID]);
      app.ls.eclipse = JSON.stringify(currentRepo, null, 2);
      app.loadJSONViewer();
      clearTimeout(categoryHandler);
      categoryHandler = setTimeout(function(){
        app.loadCategories();
      }, 2000);
    });

    $("[edit-game]").on("input", function(){
      var currentRepo = JSON.parse(app.ls.eclipse);
      var game = JSON.parse(atob($(this).attr("edit-game")));
    //  console.log(game);
      var newValue = $(this).val();
      currentRepo.categories[game['category']].games[game['game']][game['selector']] = newValue;
      app.ls.eclipse = JSON.stringify(currentRepo, null, 2);
      app.loadJSONViewer();
    //  console.log(currentRepo);
    });

    $(".categories .category .name").unbind();
    $(".categories .category .name").click(function(){
      if($(this).hasClass('active')) {
        $(this).removeClass("active");
        $(this).parent().find(".games").hide();
      } else {
        $(this).addClass("active");
        $(this).parent().find(".games").show();
      }
    });
  }

  app.addCategory = function() {
    var currentRepo = JSON.parse(app.ls.eclipse);
    var arr = {
      "categoryname": "Blank Category",
      "games": [
        {
          "name": "Example Game",
          "link": "https://example.com/game.gba",
          "boxart": "https://example.com/art.png",
          "system": "GBA"
        }
      ]
    };
    currentRepo.categories.push(arr);
    app.ls.eclipse = JSON.stringify(currentRepo, null, 2);
    app.loadEditor();
  }

  app.deleteCategory = function(id) {
    var currentRepo = JSON.parse(app.ls.eclipse);
    var category = atob(id);
    var theCategory = currentRepo.categories[category];
    var confirmDelete = confirm("Are you sure you would like to delete the Category \""+theCategory.categoryname+"\"?");
    if(confirmDelete) {
    //  delete currentRepo.categories[category];
      currentRepo.categories.splice(category, 1);
      app.ls.eclipse = JSON.stringify(currentRepo, null, 2);
      app.loadEditor();
    }
  }

  app.addGame = function(id) {
    var category = atob(id);
    var currentRepo = JSON.parse(app.ls.eclipse);
    var arr = {
          "name": "Game Name",
          "link": "https://example.com/game.gba",
          "boxart": "https://example.com/boxart.png",
          "system": "GBA"
        };
    currentRepo.categories[category].games.push(arr);
    app.ls.eclipse = JSON.stringify(currentRepo, null, 2);
    app.loadEditor();
  }

  app.deleteGame = function(cat, id) {
    var currentRepo = JSON.parse(app.ls.eclipse);
    var category = atob(cat);
    var game = atob(id);
    var theGame = currentRepo.categories[category].games[game];
    var confirmDelete = confirm("Are you sure you would like to delete the game \""+theGame.name+"\"?");
    if(confirmDelete) {
    //  delete currentRepo.categories[category];
      currentRepo.categories[category].games.splice(id, 1);
      app.ls.eclipse = JSON.stringify(currentRepo, null, 2);
      app.loadEditor();
    }
  }

  app.init();

  app.editBasic = function(id) {
    var currentRepo = JSON.parse(app.ls.eclipse);
    var editValue = $("[edit-basic='"+id+"']").val();

    currentRepo[id] = editValue;
    app.ls.eclipse = JSON.stringify(currentRepo, null, 2);
    app.loadJSONViewer();
    //console.log(currentRepo);
  }





}

var eclipseGen = new eclipseGenCore();


$("[edit-basic]").on("input", function(){
  var id = $(this).attr("edit-basic");
  eclipseGen.editBasic(id);
});
